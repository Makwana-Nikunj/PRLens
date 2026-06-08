import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { sql } from "../db/index.js";
import { embedTexts, embedQuery } from "./gemini-embeddings.service.js";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export async function processAndStorePRFiles(prId, prUrl, files) {
  // files is an array of { filename, status, patch }
  
  // 1. Chunking
  const docs = [];
  for (const file of files) {
    if (!file.patch) continue;
    
    const text = `Filename: ${file.filename}\nStatus: ${file.status}\n\n${file.patch}`;
    
    const chunks = await splitter.splitText(text);
    
    for (let i = 0; i < chunks.length; i++) {
      docs.push({
        prId,
        prUrl,
        filename: file.filename,
        chunkIndex: i,
        content: chunks[i],
        metadata: {
          filename: file.filename,
          status: file.status,
        }
      });
    }
  }

  if (docs.length === 0) {
    console.warn(`RAG: No docs to embed for PR ${prId}`);
    return { stored: 0 };
  }

  // 2. Embedding
  const textsToEmbed = docs.map(d => d.content);
  const embeddings = await embedTexts(textsToEmbed);

  if (!embeddings || embeddings.length === 0) {
    throw new Error(`Embeddings service returned empty result for PR ${prId}`);
  }

  const embeddingDim = embeddings[0].length;
  if (embeddingDim !== 1536) {
    throw new Error(
      `Embedding dimension mismatch for PR ${prId}: got ${embeddingDim}, expected 1536`
    );
  }

  if (embeddings.length !== docs.length) {
    throw new Error(
      `Embedding count mismatch for PR ${prId}: got ${embeddings.length}, expected ${docs.length}`
    );
  }

  // 3. Storage
  const rowsToInsert = docs.map((doc, idx) => ({
    pr_id: doc.prId,
    pr_url: doc.prUrl,
    filename: doc.filename,
    chunk_index: doc.chunkIndex,
    content: doc.content,
    embedding: `[${embeddings[idx].join(",")}]`,
    metadata: doc.metadata
  }));

  const chunkSize = 100;
  for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
    const chunk = rowsToInsert.slice(i, i + chunkSize);
    await sql`
      INSERT INTO pr_embeddings ${sql(chunk, "pr_id", "pr_url", "filename", "chunk_index", "content", "embedding", "metadata")}
    `;
  }

  const totalStored = rowsToInsert.length;
  console.log(`RAG: Stored ${totalStored} chunks for PR ${prId}`);
  return { stored: totalStored };
}

export async function retrieveRelevantChunks(prId, query) {
  const queryVector = await embedQuery(query);
  const threshold = parseFloat(process.env.RAG_SIMILARITY_THRESHOLD || "0.75");
  const limit = parseInt(process.env.RAG_TOP_K || "5", 10);

  const results = await sql`
    SELECT
      content,
      filename,
      1 - (embedding <=> ${`[${queryVector.join(",")}]`}::vector) AS similarity
    FROM pr_embeddings
    WHERE pr_id = ${prId}
      AND (1 - (embedding <=> ${`[${queryVector.join(",")}]`}::vector)) >= ${threshold}
    ORDER BY embedding <=> ${`[${queryVector.join(",")}]`}::vector
    LIMIT ${limit}
  `;

  console.log({
    prId,
    query,
    chunksRetrieved: results.length,
    similarityScores: results.map(r => r.similarity)
  });

  return results;
}

export async function cleanupPRVectors(prId) {
  await sql`
    DELETE FROM pr_embeddings WHERE pr_id = ${prId}
  `;
}
