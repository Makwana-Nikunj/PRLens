import "dotenv/config";
import { embeddingModel } from "./index.js";

async function runEmbeddingsTest() {
  console.log("Starting Embeddings Layer Test...\n");

  // 1. Create sample chunk strings (LangChain's embedDocuments expects string arrays,
  // we map the pageContent out of the Document[] in the RAG pipeline later)
  const chunks = [
    // Code
    "function authenticateUser(req, res) {\n  const token = req.headers.authorization;\n  return verify(token);\n}",
    // Git Diff
    "@@ -10,5 +10,8 @@\n- const user = null;\n+ const user = await db.getUser();\n  return user;",
    // Markdown
    "## Authentication\n\nThis section describes how we verify incoming requests using JWT tokens."
  ];

  console.log(`Testing embedDocuments with ${chunks.length} chunks...`);
  
  // 2. Test document embedding
  const documentVectors = await embeddingModel.embedDocuments(chunks);
  
  console.log(`Documents embedded: ${documentVectors.length}`);
  console.log(`Is Array? ${Array.isArray(documentVectors)}`);
  
  if (documentVectors.length === chunks.length) {
    const vectorDim = documentVectors[0].length;
    console.log(`Vector numeric check: ${typeof documentVectors[0][0] === "number"}`);
    console.log(`Document Vector dimension: ${vectorDim}`);

    // Check consistency
    const consistent = documentVectors.every(v => v.length === vectorDim);
    console.log(`Dimensions consistent across all chunks: ${consistent}`);
    
    // 3. Test query embedding
    console.log(`\nTesting embedQuery...`);
    const query = "How does authentication work?";
    const queryVector = await embeddingModel.embedQuery(query);
    
    const queryDim = queryVector.length;
    console.log(`Query Vector dimension: ${queryDim}`);
    
    console.log(`Dimensions match: ${vectorDim === queryDim}`);
  }
}

runEmbeddingsTest().catch(console.error);
