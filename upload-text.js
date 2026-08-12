const fs = require('fs');

async function processText() {
    const textPath = '/Users/tranhaibang/.gemini/antigravity/scratch/airead/book.txt';
    const textContent = fs.readFileSync(textPath, 'utf-8');
    
    const pages = textContent.split('\f');
    const validPages = pages.filter(p => p.trim().length > 0);
    
    console.log(`Extracted ${validPages.length} pages.`);
    
    const pageObjects = validPages.map((text, i) => ({
        pageNumber: i + 1,
        text: text.trim()
    }));
    
    const payload = {
        title: "Binh Pháp Tôn Tử",
        numPages: validPages.length,
        pages: pageObjects
    };
    
    console.log("Uploading to local database via API...");
    try {
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
        console.error("Error communicating with API:", err);
    }
}

processText();
