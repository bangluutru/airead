import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { lessons } from "@/db/schema";
import { GoogleGenAI, Type } from "@google/genai";

export async function POST(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const { lessonId } = await params;
    
    // Check API Key
    const apiKey = process.env.GEMINI_API_KEY || (getRequestContext().env as any).GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const db = drizzle(getRequestContext().env.DB);
    
    // Fetch the lesson
    const lesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).get();
    
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (lesson.isAnalyzed) {
      return NextResponse.json({ message: "Lesson is already analyzed" }, { status: 400 });
    }

    // Initialize Gemini API
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert reading assistant and Socratic tutor. 
Analyze the following book excerpt and extract these insights:
1. keyIdea: The single most important core thesis or behavior change idea in this text.
2. whyItMatters: Why this idea is significant for the reader's life or understanding.
3. authorMeaning: What the author is fundamentally trying to convey or argue against.
4. argumentMap: An array of strings representing the logical steps of the author's argument.
5. assumptions: An array of strings representing underlying assumptions the author makes.
6. deepAnalysis: A deep critical analysis of the text's logical strength and potential boundaries.

Excerpt to analyze:
"""
${lesson.content}
"""
`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        keyIdea: { type: Type.STRING },
        whyItMatters: { type: Type.STRING },
        authorMeaning: { type: Type.STRING },
        deepAnalysis: { type: Type.STRING },
        argumentMap: { type: Type.ARRAY, items: { type: Type.STRING } },
        assumptions: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["keyIdea", "whyItMatters", "authorMeaning", "deepAnalysis", "argumentMap", "assumptions"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2
      }
    });

    if (!response.text) {
      throw new Error("AI returned empty response");
    }

    const aiResult = JSON.parse(response.text);

    // Save to DB
    await db.update(lessons).set({
      isAnalyzed: true,
      keyIdea: aiResult.keyIdea,
      whyItMatters: aiResult.whyItMatters,
      authorMeaning: aiResult.authorMeaning,
      deepAnalysis: aiResult.deepAnalysis,
      argumentMap: aiResult.argumentMap,
      assumptions: aiResult.assumptions
    }).where(eq(lessons.id, lessonId));

    return NextResponse.json({ success: true, message: "Analysis complete" });

  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze lesson" }, { status: 500 });
  }
}
