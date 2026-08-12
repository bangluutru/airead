import { z } from "zod";
import { aiProvider } from "@/lib/ai/providers/gemini";
import { ExtractedPage } from "@/lib/pdf/extractor";

export const StructureNodeSchema = z.object({
  id: z.string().describe("A unique identifier for this node, e.g. 'part-1' or 'chapter-1'"),
  title: z.string().describe("The title of this section, e.g. 'Chapter 1: The Beginning'"),
  type: z.enum(["FRONT_MATTER", "PART", "CHAPTER", "SECTION", "SUBSECTION", "BACK_MATTER"]).describe("The structural type of this node."),
  startPage: z.number().describe("The page number where this section begins."),
  endPage: z.number().nullable().describe("The page number where this section ends. Null if unknown."),
  children: z.lazy(() => z.array(StructureNodeSchema)).optional().describe("Child sections, e.g. sections inside a chapter."),
});

export type StructureNode = z.infer<typeof StructureNodeSchema>;

export const BookStructureSchema = z.object({
  nodes: z.array(StructureNodeSchema),
  confidenceScore: z.number().min(0).max(100).describe("Overall confidence in the detected structure (0-100)."),
  isAiDerived: z.boolean().describe("True if the structure had to be heavily inferred by AI because the book lacked clear structure."),
});

export type BookStructure = z.infer<typeof BookStructureSchema>;

export async function detectBookStructure(
  tocPages: ExtractedPage[],
  allPagesSample: ExtractedPage[] // A sample of pages (e.g. first 50 pages) to give context
): Promise<BookStructure> {
  // We compress the text to fit in context and just look for headings/TOC
  const tocText = tocPages.map(p => `[Page ${p.pageNumber}]\n${p.text}`).join("\n\n");
  
  const prompt = `
    You are an expert structural editor. Your task is to reconstruct the hierarchical structure of a book based primarily on its Table of Contents and a sampling of its pages.
    
    Here is the text extracted from what appears to be the Table of Contents or early pages:
    """
    ${tocText}
    """
    
    Your task:
    1. Reconstruct the hierarchical structure of the book (Parts, Chapters, Sections).
    2. Do NOT invent chapters that do not exist. Rely strictly on the provided text.
    3. Identify the start page for each structural element based on the page numbers listed in the text.
    4. Estimate the end page if possible, otherwise leave it null.
    5. If the book lacks a clear author-defined structure, try to infer a logical semantic structure but mark 'isAiDerived' as true.
  `;

  try {
    const structure = await aiProvider.generateStructuredData(prompt, BookStructureSchema, {
      model: "gemini-1.5-flash", 
      temperature: 0.1, 
    });
    
    return structure;
  } catch (error) {
    console.error("Error in Pass 2 - Structure Detection:", error);
    throw error;
  }
}
