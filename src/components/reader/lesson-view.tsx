import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function LessonView({ lesson }: { lesson: any }) {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 pb-32">
      {/* Lesson Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <span>Lesson {lesson.sequence}</span>
          <span>•</span>
          <span>{lesson.estimatedMinutes} min read</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">{lesson.title}</h1>
        <p className="text-lg text-muted-foreground">{lesson.chapter}</p>
      </header>

      {/* Why This Matters */}
      <section className="mb-10 bg-muted/30 p-5 rounded-lg border-l-4 border-primary">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Why This Matters</h3>
        <p className="text-foreground/90 italic">{lesson.whyItMatters}</p>
      </section>

      {/* Read Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">The Idea</h2>
        <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed">
          {lesson.read}
        </div>
      </section>

      {/* Key Idea */}
      <section className="mb-10">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <span className="text-xl">💡</span> Key Takeaway
            </h3>
            <p className="text-lg font-medium">{lesson.keyIdea}</p>
          </CardContent>
        </Card>
      </section>

      {/* Key Quotes */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">From the Author</h2>
        <div className="space-y-6">
          {lesson.quotes.map((q: any, idx: number) => (
            <figure key={idx} className="relative">
              <blockquote className="text-xl font-medium italic text-foreground/80 border-l-4 border-muted-foreground/30 pl-6 py-2">
                "{q.quote}"
              </blockquote>
              <figcaption className="mt-3 text-sm text-muted-foreground pl-6">
                <strong>Why it's important:</strong> {q.reasonSelected}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      {/* Deep Analysis (AI) */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">Deeper Analysis</h2>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">AI Interpretation</Badge>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">What the author really means</h3>
            <p className="text-foreground/80">{lesson.authorMeaning}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Hidden Assumptions</h3>
            <ul className="list-disc pl-5 space-y-1 text-foreground/80">
              {lesson.assumptions.map((a: string, i: number) => <li key={i}>{a}</li>)}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Critical Evaluation</h3>
            <p className="text-foreground/80">{lesson.deepAnalysis}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
