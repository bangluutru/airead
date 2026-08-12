import * as fs from 'fs';
import * as path from 'path';
import { extractTextFromPDF } from '../lib/pdf/extractor';

async function runTest() {
  const filePath = "/Users/tranhaibang/Downloads/Books/8384-binh-phap-ton-tu-va-36-muu-ke-thuviensach.vn.pdf";
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`Starting PDF Ingestion Test for: ${path.basename(filePath)}`);
  
  const buffer = fs.readFileSync(filePath);
  // Convert Node Buffer to ArrayBuffer
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  console.log("Extracting text and pages...");
  const startTime = Date.now();
  
  try {
    const result = await extractTextFromPDF(arrayBuffer);
    const duration = (Date.now() - startTime) / 1000;
    
    console.log(`\n✅ Extraction Successful in ${duration.toFixed(2)}s!`);
    console.log(`Title from Metadata: ${result.title}`);
    console.log(`Total Pages Extracted: ${result.numPages}`);
    console.log(`\n--- First 3 Pages Preview ---`);
    
    for (let i = 0; i < Math.min(3, result.pages.length); i++) {
      console.log(`\nPage ${result.pages[i].pageNumber}:`);
      console.log(result.pages[i].text.substring(0, 300) + (result.pages[i].text.length > 300 ? "..." : ""));
    }
    
    console.log("\nPipeline MVP Test (Ingestion Phase) Completed Successfully.");
    
  } catch (error) {
    console.error("\n❌ Extraction Failed:", error);
  }
}

runTest();
