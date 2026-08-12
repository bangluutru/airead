import { z } from "zod";
import { aiProvider } from "@/lib/ai/providers/gemini";

// Zod Schema representing the desired output structure
export const MetadataSchema = z.object({
  title: z.string().nullable().describe("The primary title of the book. Null if uncertain."),
  author: z.string().nullable().describe("The author or authors of the book. Null if uncertain."),
  publisher: z.string().nullable().describe("The publisher of the book. Null if uncertain."),
  publicationYear: z.number().nullable().describe("The year of publication. Null if uncertain."),
  isbn: z.string().nullable().describe("The ISBN number if found. Null if uncertain."),
  language: z.string().nullable().describe("The primary language of the text. E.g. 'en', 'vi'. Null if uncertain."),
  confidenceScore: z.number().min(0).max(100).describe("Overall confidence in the extracted metadata (0-100).")
});

export type BookMetadata = z.infer<typeof MetadataSchema>;

export async function extractMetadata(
  firstFewPagesText: string, 
  fileName: string
): Promise<BookMetadata> {
  const prompt = `
    You are an expert librarian AI. Your task is to extract bibliographic metadata from the provided text, which comes from the first few pages of a book.
    
    File Name: ${fileName}
    
    Extracted Text:
    """
    ${firstFewPagesText}
    """
    
    Extract the title, author, publisher, publication year, ISBN, and language.
    CRITICAL RULES:
    1. Only extract information that is explicitly present or highly probable based on the text.
    2. Do NOT invent or hallucinate metadata. If a field is missing, return null.
    3. Provide an overall confidence score (0-100) for your extraction.
  `;

  try {
    const metadata = await aiProvider.generateStructuredData(prompt, MetadataSchema, {
      model: "gemini-1.5-flash",
      temperature: 0.1, // Very low temperature for factual extraction
    });
    
    return metadata;
  } catch (error) {
    console.error("Error in Pass 1 - Metadata Extraction:", error);
    throw error;
  }
}
