import { UploadBook } from "@/components/library/upload-book";

export default function LibraryPage() {
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
        {/* Mock Book Card for MVP Integration Test */}
        <a href="/books/binh-phap-ton-tu/read/lesson-1" className="block group">
          <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card text-card-foreground">
            <div className="h-48 bg-muted flex items-center justify-center p-4 text-center border-b group-hover:bg-primary/5 transition-colors">
              <h3 className="font-serif text-xl font-bold">Binh Pháp Tôn Tử và 36 Mưu Kế</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Tôn Vũ</p>
              <div className="flex justify-between text-sm mb-1">
                <span>Reading Progress</span>
                <span className="font-medium">12%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5 mb-4">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: "12%" }}></div>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>62 lessons total</span>
                <span className="text-primary font-medium">Continue Reading</span>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
