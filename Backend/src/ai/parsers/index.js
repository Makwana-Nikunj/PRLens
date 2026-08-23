import { StructuredOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

/**
 * Zod schema defining the exact structure required for PR analysis.
 */
export const prAnalysisSchema = z.object({
  summary: z.string(),
  key_changes: z.array(z.string()),
  tradeoffs: z.array(z.string()),
  risks: z.array(z.string()),
  reviewer_checklist: z.array(z.string()),
  file_explanations: z.record(z.string())
});

/**
 * Parser for the PR analysis output.
 * Ensures the LLM response is safely parsed into a JavaScript object conforming to the Zod schema.
 */
export const prAnalysisParser = StructuredOutputParser.fromZodSchema(prAnalysisSchema);

/**
 * Parser for the chat assistant output.
 * Extracts the raw string content from the LLM's message, which is useful for streaming.
 */
export const chatParser = new StringOutputParser();
