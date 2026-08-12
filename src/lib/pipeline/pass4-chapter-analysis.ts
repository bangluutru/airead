import { z } from "zod";
import { aiProvider } from "@/lib/ai/providers/gemini";
import { SemanticChunk } from "./pass3-chunking";

export const ChapterAnalysisSchema = z.object({
  chapterPurpose: z.string().describe("What is the primary purpose of this chapter?"),
  mainQuestion: z.string().describe("What is the core question this chapter attempts to answer?"),
  mainArgument: z.string().describe("What is the main argument or thesis of this chapter?"),
  keyConcepts: z.array(z.string()).describe("List of 3-7 core concepts introduced or discussed."),
  supportingArguments: z.array(z.string()).describe("List of arguments supporting the main thesis."),
  importantExamples: z.array(z.string()).describe("Key examples used to illustrate the concepts."),
  importantEvidence: z.array(z.string()).describe("Key evidence, research, or data provided."),
  assumptions: z.array(z.string()).describe("Explicit or implicit assumptions made by the author."),
  difficultyLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).describe("Estimated cognitive difficulty of this chapter."),
  estimatedLearningTimeMinutes: z.number().describe("Estimated time in minutes to deeply read and process this chapter.")
});

export type ChapterAnalysis = z.infer<typeof ChapterAnalysisSchema>;

export async function analyzeChapter(
  chapterTitle: string,
  chunks: SemanticChunk[]
): Promise<ChapterAnalysis> {
  
  // To avoid exceeding context windows, we just pass the summaries of the chunks
  // If the context window is large enough (like Gemini 1.5), we could pass the full text.
  // For safety and cost, we'll construct a compressed representation.
  const compressedText = chunks.map((c, i) => `[Chunk ${i} - ${c.type}] Summary: ${c.summary}\nText: ${c.sourceText}`).join("\n\n");

  const prompt = `
    You are an expert academic reader and pedagogical designer. 
    Your task is to generate a deep structural intelligence map of a book chapter.
    
    Chapter Title: ${chapterTitle}
    
    Chapter Content (represented as Semantic Chunks):
    """
    ${compressedText}
    """
    
    Your task is to construct an internal chapter model analyzing the deep structure of the author's argument.
    Do not summarize superficially. Look for the underlying intellectual architecture: the main question, the thesis, the supporting pillars (arguments, evidence), and hidden assumptions.
  `;

  try {
    const analysis = await aiProvider.generateStructuredData(prompt, ChapterAnalysisSchema, {
      model: "gemini-1.5-pro", 
      temperature: 0.2,
    });
    
    return analysis;
  } catch (error) {
    console.error("Error in Pass 4 - Chapter Analysis:", error);
    throw error;
  }
}
