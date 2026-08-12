import { z } from "zod";
import { aiProvider } from "@/lib/ai/providers/gemini";
import { ExtractedPage } from "@/lib/pdf/extractor";

export const SemanticChunkSchema = z.object({
  id: z.string().describe("A generated unique ID for this chunk"),
  sequence: z.number().describe("The sequential order of this chunk within the section"),
  pageStart: z.number().describe("The starting page number for this chunk"),
  pageEnd: z.number().describe("The ending page number for this chunk"),
  sourceText: z.string().describe("The exact original text for this chunk, preserving fidelity."),
  summary: z.string().describe("A brief 1-sentence summary of what this chunk is about"),
  type: z.enum(["ARGUMENT", "CONCEPT", "EXAMPLE", "STORY", "DEFINITION", "OTHER"]).describe("The primary semantic type of this chunk")
});

export const ChunkingResultSchema = z.object({
  chunks: z.array(SemanticChunkSchema).describe("The array of semantic chunks extracted from the text.")
});

export type SemanticChunk = z.infer<typeof SemanticChunkSchema>;

export async function createSemanticChunks(
  sectionText: string,
  startPage: number,
  endPage: number
): Promise<SemanticChunk[]> {
  const prompt = `
    You are an expert cognitive linguist and editor. Your task is to perform semantic chunking on the provided book section.
    
    Section Text (Pages ${startPage} - ${endPage}):
    """
    ${sectionText}
    """
    
    CRITICAL RULES FOR CHUNKING:
    1. Do NOT split content by arbitrary token length. Chunks must respect semantic boundaries.
    2. A chunk should represent exactly ONE of the following:
       - One coherent argument
       - One specific concept
       - One distinct example or story
       - One explanatory unit
    3. A chunk should contain enough context to be understood independently, but no more.
    4. The \`sourceText\` MUST be an exact verbatim substring from the original text (allowing for overlap at edges to preserve context). Do not paraphrase the sourceText.
    5. Maintain the chronological sequence.
    6. Estimate \`pageStart\` and \`pageEnd\` based on where the text likely falls between ${startPage} and ${endPage}.
  `;

  try {
    const result = await aiProvider.generateStructuredData(prompt, ChunkingResultSchema, {
      model: "gemini-1.5-pro", // Pro model for better semantic reasoning
      temperature: 0.1,
    });
    
    return result.chunks;
  } catch (error) {
    console.error("Error in Pass 3 - Semantic Chunking:", error);
    throw error;
  }
}
