import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedBook {
  title: string;
  numPages: number;
  pages: ExtractedPage[];
  metadata: any;
}

export async function extractTextFromPDF(buffer: ArrayBuffer): Promise<ExtractedBook> {
  // Load the PDF document
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer), useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true });
  const pdfDocument = await loadingTask.promise;
  
  const numPages = pdfDocument.numPages;
  const pages: ExtractedPage[] = [];
  
  let title = "Unknown Title";
  try {
    const metadata = await pdfDocument.getMetadata();
    if (metadata && metadata.info && (metadata.info as any).Title) {
      title = (metadata.info as any).Title;
    }
  } catch (e) {
    console.warn("Could not extract metadata", e);
  }

  // Iterate through each page
  for (let i = 1; i <= numPages; i++) {
    try {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      
      // Combine the text items
      const text = textContent.items
        .map((item: any) => item.str)
        .join(" ")
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();
        
      pages.push({
        pageNumber: i,
        text,
      });
    } catch (e) {
      console.error(`Error extracting page ${i}`, e);
      // Push empty text so page numbers remain aligned
      pages.push({
        pageNumber: i,
        text: "",
      });
    }
  }

  return {
    title,
    numPages,
    pages,
    metadata: {},
  };
}
