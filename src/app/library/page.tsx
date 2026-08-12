import { UploadBook } from "@/components/library/upload-book";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";
import { books } from "@/db/schema";
import Link from "next/link";

export const runtime = "edge";

export default async function LibraryPage() {
  const db = drizzle(getRequestContext().env.DB);
  const myBooks = await db.select().from(books).all();

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Library</h1>
          <p className="text-muted-foreground mt-1">
            Your personal collection of deep reading books.
          </p>
        </div>
        <UploadBook />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myBooks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
            You haven't uploaded any books yet. Click "Upload Book" to get started.
          </div>
        ) : (
          myBooks.map((book) => (
            <Link key={book.id} href={`/books/${book.id}/read/lesson-1`} className="block group">
              <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card text-card-foreground">
                <div className="h-48 bg-muted flex items-center justify-center p-4 text-center border-b group-hover:bg-primary/5 transition-colors">
                  <h3 className="font-serif text-xl font-bold">{book.title}</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Reading Progress</span>
                    <span className="font-medium">0%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5 mb-4">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: "0%" }}></div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Pending AI Analysis</span>
                    <span className="text-primary font-medium">Start Reading</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
