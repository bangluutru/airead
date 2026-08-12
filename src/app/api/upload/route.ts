import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/pdf/extractor";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    console.log(`Received file: ${file.name} (${file.size} bytes)`);

    // Extract text from the PDF
    const arrayBuffer = await file.arrayBuffer();
    const extractedData = await extractTextFromPDF(arrayBuffer);
    
    console.log(`Extracted ${extractedData.numPages} pages.`);
    
    // In Phase 1, we will mock storing to DB and just return success.
    // The next pipeline steps (Pass 1-8) will be triggered from here or a background job.
    
    return NextResponse.json({
      success: true,
      message: "PDF extracted successfully",
      data: {
        title: extractedData.title,
        numPages: extractedData.numPages,
        // We don't return the full text to the client to save bandwidth
      }
    });

  } catch (error: any) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process PDF" },
      { status: 500 }
    );
  }
}
