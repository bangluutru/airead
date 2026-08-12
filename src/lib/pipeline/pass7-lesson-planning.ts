import { z } from "zod";
import { aiProvider } from "@/lib/ai/providers/gemini";
import { SemanticChunk } from "./pass3-chunking";
import { ChapterAnalysis } from "./pass4-chapter-analysis";

export const LessonPlanSchema = z.object({
  id: z.string().describe("A unique ID for this lesson plan, e.g. 'lesson-1'"),
  title: z.string().describe("A compelling title for the micro-lesson"),
  sequence: z.number().describe("The order in which this lesson should be read"),
  estimatedMinutes: z.number().describe("Estimated minutes to read (typically 3-8)"),
  sourceChunkIds: z.array(z.string()).describe("The IDs of the semantic chunks this lesson covers"),
  lessonFocus: z.string().describe("Brief description of what this lesson is meant to teach")
});

export const ChapterLessonPlanSchema = z.object({
  lessons: z.array(LessonPlanSchema).describe("The sequence of micro-lessons for this chapter")
});

export type LessonPlan = z.infer<typeof LessonPlanSchema>;

export async function createLessonPlan(
  chapterTitle: string,
  chapterAnalysis: ChapterAnalysis,
  chunks: SemanticChunk[]
): Promise<LessonPlan[]> {
  const compressedChunks = chunks.map(c => `[Chunk ${c.id}] Summary: ${c.summary}`).join("\n");
  
  const prompt = `
    You are an expert Learning Experience Designer.
    Your task is to divide the chapter into a series of Micro-Learning Sessions.
    
    Chapter: ${chapterTitle}
    Main Argument: ${chapterAnalysis.mainArgument}
    
    Semantic Chunks Available:
    """
    ${compressedChunks}
    """
    
    RULES:
    1. A micro-lesson should require approx 3-8 minutes.
    2. Divide the chunks into logical groupings that represent a meaningful cognitive unit.
    3. Do NOT use a fixed number of lessons. Use typical range of 3-10 per chapter.
    4. Provide a sequence, title, and the exact chunk IDs that belong to each lesson.
    5. Avoid creating tiny meaningless fragments.
  `;

  try {
    const plan = await aiProvider.generateStructuredData(prompt, ChapterLessonPlanSchema, {
      model: "gemini-1.5-pro",
      temperature: 0.3, 
    });
    
    return plan.lessons;
  } catch (error) {
    console.error("Error in Pass 7 - Lesson Planning:", error);
    throw error;
  }
}
