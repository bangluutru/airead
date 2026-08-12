import { LessonView } from "@/components/reader/lesson-view";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { books, chapters, lessons } from "@/db/schema";
import { notFound } from "next/navigation";

export const runtime = "edge";

export default async function ReadLessonPage({ params }: { params: Promise<{ bookId: string; lessonId: string }> }) {
  const { bookId, lessonId } = await params;
  
  const db = drizzle(getRequestContext().env.DB);

  // Fetch the book
  const bookRecord = await db.select().from(books).where(eq(books.id, bookId)).get();
  if (!bookRecord) return notFound();

  // Fetch chapters for the sidebar
  const bookChapters = await db.select().from(chapters).where(eq(chapters.bookId, bookId)).all();

  // Fetch the current lesson
  const currentLesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).get();
  
  // Also fetch all lessons to build the navigation (just for the current chapter for simplicity, or all chapters)
  const allLessons = await db.select().from(lessons).where(eq(lessons.chapterId, currentLesson?.chapterId || "")).all();

  // If no lesson matches the ID (or it's a fallback like "lesson-1"), try to find the first lesson
  let activeLesson = currentLesson;
  if (!activeLesson && lessonId === "lesson-1") {
    // Just grab the very first lesson in the book
    const firstChapter = bookChapters[0];
    if (firstChapter) {
      activeLesson = await db.select().from(lessons).where(eq(lessons.chapterId, firstChapter.id)).get();
    }
  }

  if (!activeLesson) {
    return <div className="p-8">Lesson not found.</div>;
  }

  // Map to the LessonView props format
  const mappedLesson = {
    id: activeLesson.id,
    chapter: bookChapters.find(c => c.id === activeLesson?.chapterId)?.title || "Chapter",
    sequence: activeLesson.order,
    title: activeLesson.title,
    estimatedMinutes: Math.ceil(activeLesson.content.split(" ").length / 200),
    whyItMatters: activeLesson.isAnalyzed ? activeLesson.whyItMatters : "This is raw extracted text. AI analysis is pending.",
    read: activeLesson.content,
    keyIdea: activeLesson.isAnalyzed ? activeLesson.keyIdea : "AI insights will be generated in Phase 3.",
    quotes: [], // Not implemented yet
    authorMeaning: activeLesson.isAnalyzed ? activeLesson.authorMeaning : "",
    argumentMap: activeLesson.isAnalyzed ? (activeLesson.argumentMap as unknown as string[]) : [],
    deepAnalysis: activeLesson.isAnalyzed ? activeLesson.deepAnalysis : "",
    assumptions: activeLesson.isAnalyzed ? (activeLesson.assumptions as unknown as string[]) : [],
    isAnalyzed: activeLesson.isAnalyzed
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Navigation */}
      <aside className="w-64 border-r bg-muted/10 hidden md:block overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="font-semibold truncate">{bookRecord.title}</h2>
          <p className="text-sm text-muted-foreground">{bookRecord.author}</p>
        </div>
        
        <div className="p-4 space-y-4 text-sm">
          {bookChapters.map((ch) => (
            <div key={ch.id} className="space-y-1">
              <div className="font-medium">{ch.title}</div>
              <div className="space-y-1 mt-1">
                 {/* Normally we'd nest lessons here. For now just show the active chapter's lessons */}
                 {ch.id === activeLesson?.chapterId && allLessons.map((l) => (
                    <div 
                      key={l.id} 
                      className={`pl-4 py-1 cursor-pointer border-l-2 ${l.id === activeLesson?.id ? 'text-primary font-medium border-primary' : 'text-muted-foreground border-transparent hover:border-primary'}`}
                    >
                      {l.order}. {l.title}
                    </div>
                 ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Reading Area */}
      <main className="flex-1 overflow-y-auto">
        <LessonView lesson={mappedLesson} />
      </main>

      {/* Right Sidebar - Tools */}
      <aside className="w-72 border-l bg-muted/10 hidden lg:block overflow-y-auto p-4">
        <h3 className="font-semibold mb-4">Tools</h3>
        <div className="space-y-4">
          <div className="p-3 bg-background border rounded-lg shadow-sm">
            <h4 className="text-sm font-medium mb-1">AI Socratic Tutor</h4>
            <p className="text-xs text-muted-foreground mb-3">Discuss this idea deeply with your AI tutor.</p>
            <button className="w-full text-xs bg-primary text-primary-foreground py-2 rounded-md font-medium">Discuss this idea</button>
          </div>
          <div className="p-3 bg-background border rounded-lg shadow-sm">
            <h4 className="text-sm font-medium mb-1">Personal Notes</h4>
            <textarea className="w-full h-24 text-sm p-2 border rounded resize-none" placeholder="Add a thought or connection..."></textarea>
          </div>
        </div>
      </aside>
    </div>
  );
}
