import { z } from "zod";
import { aiProvider } from "@/lib/ai/providers/gemini";
import { SemanticChunk } from "./pass3-chunking";
import { LessonPlan } from "./pass7-lesson-planning";

export const LessonContentSchema = z.object({
  whyItMatters: z.string().describe("1-3 short sentences explaining why this lesson matters inside the argument of the book."),
  read: z.string().describe("Clear reconstruction of the idea. 400-1000 words. Preserve author intent."),
  keyIdea: z.string().describe("1-3 sentences summarizing the core takeaway."),
  quotes: z.array(z.object({
    quote: z.string(),
    reasonSelected: z.string(),
    sourceChunkId: z.string()
  })).describe("Select ONLY genuinely useful quotes, exactly matching source text."),
  authorMeaning: z.string().describe("Explanation of the deeper meaning. What is the author really arguing?"),
  argumentMap: z.array(z.string()).describe("A structured text representation of the reasoning (cause chains, etc)."),
  assumptions: z.array(z.string()).describe("Identify assumptions behind the argument."),
  deepAnalysis: z.string().describe("Critical analysis (Logical strength, boundaries, tensions)."),
  connections: z.array(z.string()).describe("Connect current lesson with previous lessons or whole book thesis."),
  socraticQuestions: z.array(z.string()).describe("1-3 questions requiring reasoning, not factual recall.")
});

export type LessonContent = z.infer<typeof LessonContentSchema>;

export async function generateLessonContent(
  plan: LessonPlan,
  lessonChunks: SemanticChunk[]
): Promise<LessonContent> {
  const sourceText = lessonChunks.map(c => `[Chunk ${c.id}]\n${c.sourceText}`).join("\n\n");

  const prompt = `
    You are an elite Book Analysis Editor and Learning Experience Designer.
    Your task is to generate the deep reading content for a single micro-lesson.
    
    Lesson Title: ${plan.title}
    Lesson Focus: ${plan.lessonFocus}
    
    Source Text for this Lesson:
    """
    ${sourceText}
    """
    
    CRITICAL RULES:
    1. **Why This Matters**: 1-3 short sentences placing this lesson in context.
    2. **Read Section**: Reconstruct the idea clearly. Preserve the author's intent, distinctions, and logical sequence. Simplify difficult wording. Do NOT add external knowledge here. (Target ~400 words based on source size).
    3. **Key Idea**: Answer "If I remember only one thing, what should it be?" in 1-3 sentences.
    4. **Quotes**: Pick ONLY 1-2 essential quotes EXACTLY from the source text. Do NOT hallucinate quotes.
    5. **Author Meaning**: Explain what the casual reader might miss.
    6. **Deep Analysis**: Analyze logical strength, boundaries, missing variables. Do not just criticize.
    7. **Strict Separation**: Keep Author's Position strictly separated from AI Interpretation/Analysis.
  `;

  try {
    const content = await aiProvider.generateStructuredData(prompt, LessonContentSchema, {
      model: "gemini-1.5-pro",
      temperature: 0.2, // Low temp to preserve fidelity
    });
    
    return content;
  } catch (error) {
    console.error("Error in Pass 8 - Lesson Generation:", error);
    throw error;
  }
}
