import { z } from "zod";
import { ExtractedConcepts } from "./pass5-concepts";

// In a real application, Pass 6 would reconcile these concepts against a global database 
// of existing concepts to build cross-book intelligence. 
// For Phase 1 (MVP), this pass simply prepares the data structure for insertion into the DB.

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  bookId: string;
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  type: string;
}

export function buildKnowledgeGraphStub(
  bookId: string, 
  extractedData: ExtractedConcepts
): { nodes: GraphNode[], edges: GraphEdge[] } {
  
  const nodes: GraphNode[] = extractedData.concepts.map(c => ({
    id: `${bookId}_${c.id}`,
    label: c.name,
    type: c.type,
    bookId
  }));

  const edges: GraphEdge[] = extractedData.relationships.map(r => ({
    sourceId: `${bookId}_${r.sourceConceptId}`,
    targetId: `${bookId}_${r.targetConceptId}`,
    type: r.relationType
  }));

  return { nodes, edges };
}
