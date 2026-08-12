import Link from "next/link";
import { BookOpen, Sparkles, Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 md:p-12">
      <div className="max-w-2xl w-full text-center space-y-12">
        
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            Deep Reading, <br className="hidden sm:block" />
            <span className="text-primary">Powered by AI</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Transform your PDFs into structured, interactive learning experiences. Read, understand, and remember more.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid sm:grid-cols-3 gap-6 text-left py-8 border-y border-border/50">
          <div className="space-y-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">Auto-Analysis</h3>
            <p className="text-sm text-muted-foreground">AI extracts key ideas, arguments, and deep insights automatically.</p>
          </div>
          <div className="space-y-2">
            <BookOpen className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">Focused Reading</h3>
            <p className="text-sm text-muted-foreground">Clean, distraction-free interface designed for deep focus.</p>
          </div>
          <div className="space-y-2">
            <Brain className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">Socratic Tutor</h3>
            <p className="text-sm text-muted-foreground">Discuss concepts actively with an AI tutor grounded in your book.</p>
          </div>
        </div>

        {/* CTA */}
        <div>
          <Link 
            href="/library"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-8 py-4 text-base font-semibold transition-all duration-200 hover:bg-primary/90 hover:-translate-y-1 shadow-sm"
          >
            Enter Library
          </Link>
        </div>

      </div>
    </div>
  );
}
