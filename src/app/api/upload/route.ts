import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";
import { books, chapters, lessons } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { title, numPages, pages } = data;

    if (!title || !pages || !Array.isArray(pages)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    console.log(`Received book: ${title} (${numPages} pages)`);

    // Get D1 database binding
    const db = drizzle(getRequestContext().env.DB);
    const bookId = crypto.randomUUID();

    // 1. Insert Book
    await db.insert(books).values({
      id: bookId,
      title: title,
      author: "Unknown Author",
      uploadDate: new Date(),
    });

    // 2. We'll group pages into a single chapter for now, or maybe 10 pages per chapter
    const chapterId = crypto.randomUUID();
    await db.insert(chapters).values({
      id: chapterId,
      bookId: bookId,
      title: "Full Text",
      order: 1,
    });

    // 3. Insert lessons (let's map 1 page = 1 lesson for simplicity for now, or 5 pages = 1 lesson)
    // To avoid too many DB calls, let's chunk pages into "Lessons" of ~3 pages each
    let currentLessonText = "";
    let lessonIndex = 1;
    let pageCount = 0;
    
    for (const page of pages) {
      currentLessonText += `\n\n--- Page ${page.pageNumber} ---\n\n` + page.text;
      pageCount++;
      
      if (pageCount >= 3 || page.pageNumber === pages[pages.length - 1]?.pageNumber) {
        await db.insert(lessons).values({
          id: crypto.randomUUID(),
          chapterId: chapterId,
          title: `Pages ${page.pageNumber - pageCount + 1}-${page.pageNumber}`,
          content: currentLessonText,
          order: lessonIndex,
        });
        currentLessonText = "";
        pageCount = 0;
        lessonIndex++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "PDF extracted and saved successfully",
      data: {
        id: bookId,
        title: title,
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
