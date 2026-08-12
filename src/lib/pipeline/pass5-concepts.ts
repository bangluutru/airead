import { z } from "zod";
import { aiProvider } from "@/lib/ai/providers/gemini";
import { SemanticChunk } from "./pass3-chunking";

export const ConceptSchema = z.object({
  id: z.string().describe("A unique identifier for this concept (e.g., 'habit-loop')"),
  name: z.string().describe("The name of the concept"),
  type: z.enum(["MAIN_CONCEPT", "SUPPORTING_CONCEPT", "DEFINITION", "CLAIM", "EVIDENCE", "ASSUMPTION", "EXAMPLE"]),
  explanation: z.string().describe("A clear explanation of this concept in the context of the book"),
  sourceChunkIds: z.array(z.string()).describe("IDs of the semantic chunks where this concept appears")
});

export const RelationshipSchema = z.object({
  sourceConceptId: z.string(),
  targetConceptId: z.string(),
  relationType: z.enum([
    "CAUSES", "ENABLES", "CONFLICTS_WITH", "EXAMPLE_OF", 
    "CONDITION_FOR", "CONTRASTED_WITH", "PRECEDES", "SUPPORTS"
  ]),
  description: z.string().describe("Brief explanation of why this relationship exists")
});

export const ConceptExtractionSchema = z.object({
  concepts: z.array(ConceptSchema),
  relationships: z.array(RelationshipSchema)
});

export type ExtractedConcepts = z.infer<typeof ConceptExtractionSchema>;

export async function extractConcepts(
  chunks: SemanticChunk[]
): Promise<ExtractedConcepts> {
  const compressedText = chunks.map(c => `[Chunk ${c.id}] ${c.sourceText}`).join("\n\n");

  const prompt = `
    You are an expert epistemologist and knowledge graph engineer.
    Your task is to extract atomic concepts and their relationships from the provided text chunks.
    
    Text Chunks:
    """
    ${compressedText}
    """
    
    RULES:
    1. Extract Main Concepts, Supporting Concepts, Definitions, Claims, Evidence, Assumptions, and Examples.
    2. Link the concepts using exactly these relationship types: CAUSES, ENABLES, CONFLICTS_WITH, EXAMPLE_OF, CONDITION_FOR, CONTRASTED_WITH, PRECEDES, SUPPORTS.
    3. Ensure every concept maps back to the \`sourceChunkId\` it was found in.
  `;

  try {
    const extraction = await aiProvider.generateStructuredData(prompt, ConceptExtractionSchema, {
      model: "gemini-1.5-pro",
      temperature: 0.1,
    });
    
    return extraction;
  } catch (error) {
    console.error("Error in Pass 5 - Concept Extraction:", error);
    throw error;
  }
}
