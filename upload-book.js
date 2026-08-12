const fs = require('fs');
const pdfParse = require('pdf-parse');

async function processPdf() {
  const filePath = '/Users/tranhaibang/Downloads/Books/8384-binh-phap-ton-tu-va-36-muu-ke-thuviensach.vn.pdf';
  console.log(`Processing ${filePath}...`);
  
  const dataBuffer = fs.readFileSync(filePath);
  
  // Custom render page function to keep track of pages
  let pages = [];
  function render_page(pageData) {
    let render_options = {
        normalizeWhitespace: false,
        disableCombineTextItems: false
    }
    return pageData.getTextContent(render_options).then(function(textContent) {
        let text = '';
        let lastY = -1;
        for (let item of textContent.items) {
            if (lastY !== item.transform[5] && lastY !== -1) {
                text += '\n';
            }
            text += item.str;
            lastY = item.transform[5];
        }
        
        // Remove excessive empty lines
        text = text.replace(/\n\s*\n/g, '\n\n');
        
        pages.push({
            pageNumber: pages.length + 1,
            text: text.trim()
        });
        
        return text;
    });
  }

  const options = {
    pagerender: render_page
  };

  const parseFunc = typeof pdfParse === 'function' ? pdfParse : (pdfParse.PDFParse || pdfParse.default);

  try {
    await parseFunc(dataBuffer, options);
    console.log(`Extracted ${pages.length} pages.`);
    
    // Send to local API
    const payload = {
        title: "Binh Pháp Tôn Tử",
        numPages: pages.length,
        pages: pages
    };
    
    console.log("Uploading to local database via API...");
    const response = await fetch("http://localhost:8788/api/upload", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    if (response.ok) {
        console.log("Upload successful:", result);
    } else {
        console.error("Upload failed:", result);
    }
    
  } catch (err) {
    console.error("Error processing PDF:", err);
  }
}

processPdf();
