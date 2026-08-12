import { LessonView } from "@/components/reader/lesson-view";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { books, chapters, lessons } from "@/db/schema";
import { notFound } from "next/navigation";
import Link from "next/link";

export const runtime = "edge";

export default async function ReadLessonPage({ params }: { params: Promise<{ bookId: string; lessonId: string }> }) {
  const { bookId, lessonId } = await params;
  
  const db = drizzle(getRequestContext().env.DB);

  // Fetch the book
  const bookRecord = await db.select().from(books).where(eq(books.id, bookId)).get();
  if (!bookRecord) return notFound();

  // Fetch chapters for the sidebar
  const bookChapters = await db.select().from(chapters).where(eq(chapters.bookId, bookId)).all();

  // Fetch all books for the quick-switch bookshelf
  const allBooks = await db.select().from(books).all();

  // Fetch the current lesson
  let activeLesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).get();
  
  // If no lesson matches the ID (or it's a fallback like "lesson-1"), try to find the first lesson
  if (!activeLesson && lessonId === "lesson-1") {
    // Just grab the very first lesson in the book
    const firstChapter = bookChapters[0];
    if (firstChapter) {
      activeLesson = await db.select().from(lessons).where(eq(lessons.chapterId, firstChapter.id)).orderBy(lessons.order).get();
    }
  }

  if (!activeLesson) {
    return <div className="p-8 font-sans">Lesson not found.</div>;
  }

  // Fetch all lessons for the active chapter (or all chapters) to build navigation
  const allLessons = await db.select().from(lessons).where(eq(lessons.chapterId, activeLesson.chapterId)).orderBy(lessons.order).all();

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
      {/* Leftmost Sidebar - Bookshelf (Pin) */}
      <aside className="w-16 border-r border-border/50 bg-muted/20 hidden lg:flex flex-col items-center py-4 space-y-4 overflow-y-auto">
        <Link href="/library" className="p-2 mb-2 hover:bg-muted rounded-xl transition-all" title="Back to Library">
          <span className="text-xl">📚</span>
        </Link>
        <div className="w-8 h-px bg-border/50 mb-2"></div>
        {allBooks.map(b => (
          <Link 
            key={b.id} 
            href={`/books/${b.id}/read/lesson-1`}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-serif font-bold border transition-all ${b.id === bookId ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105' : 'bg-background hover:bg-muted border-border/50 text-foreground/70 hover:scale-105'}`}
            title={b.title}
          >
            {b.title.charAt(0).toUpperCase()}
          </Link>
        ))}
      </aside>

      {/* Left Sidebar - Table of Contents */}
      <aside className="w-64 border-r border-border/50 bg-background hidden md:block overflow-y-auto">
        <div className="p-6 border-b border-border/50">
          <h2 className="font-bold text-foreground text-lg leading-tight mb-1 font-serif">{bookRecord.title}</h2>
          <p className="text-sm text-muted-foreground">{bookRecord.author}</p>
        </div>
        
        <div className="p-4 space-y-6 text-sm font-sans">
          {bookChapters.map((ch) => (
            <div key={ch.id} className="space-y-2">
              <div className="font-bold text-foreground/80 px-2 uppercase tracking-wide text-xs">{ch.title}</div>
              <div className="space-y-1">
                 {/* Normally we'd nest lessons here. For now just show the active chapter's lessons */}
                 {ch.id === activeLesson?.chapterId && allLessons.map((l) => (
                    <Link 
                      href={`/books/${bookId}/read/${l.id}`}
                      key={l.id} 
                      className={`block px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${l.id === activeLesson?.id ? 'bg-accent/10 text-accent font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    >
                      {l.order}. {l.title}
                    </Link>
                 ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Reading Area */}
      <main className="flex-1 overflow-y-auto bg-background">
        <LessonView lesson={mappedLesson} />
      </main>

      {/* Right Sidebar - Tools */}
      <aside className="w-80 border-l border-border/50 bg-background hidden xl:block overflow-y-auto p-6">
        <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-6">Tools</h3>
        <div className="space-y-6">
          <div className="p-5 bg-accent/5 border border-accent/20 rounded-2xl">
            <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <span className="text-accent">🧠</span> AI Socratic Tutor
            </h4>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">Discuss this idea deeply with your AI tutor to solidify understanding.</p>
            <button className="w-full text-sm bg-accent hover:bg-accent/90 text-white py-3 rounded-xl font-bold transition-all duration-200">
              Discuss this idea
            </button>
          </div>
          <div className="p-5 bg-muted/20 border border-border/50 rounded-2xl">
            <h4 className="text-sm font-bold text-foreground mb-3">Personal Notes</h4>
            <textarea 
              className="w-full h-32 text-sm p-4 bg-background border border-border/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" 
              placeholder="Add a thought or connection..."
            ></textarea>
          </div>
        </div>
      </aside>
    </div>
  );
}
