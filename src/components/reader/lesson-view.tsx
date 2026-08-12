"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

export function LessonView({ lesson }: { lesson: any }) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError("");
    try {
      const res = await fetch(`/api/lessons/${lesson.id}/analyze`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze");
      }
      // Refresh the page data to get the new AI fields from D1
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

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

      {/* Read Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">The Text</h2>
        <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {lesson.read}
        </div>
      </section>

      {!lesson.isAnalyzed ? (
        <section className="mb-10 text-center bg-muted/20 p-8 rounded-lg border border-dashed">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-semibold mb-2">Deep Reading AI Analysis</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Use AI to extract the core thesis, understand the author's hidden assumptions, and map the underlying arguments.
          </p>
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing (This might take 10-20s)...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Insights
              </>
            )}
          </Button>
          {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
        </section>
      ) : (
        <>
          {/* Why This Matters */}
          {lesson.whyItMatters && (
            <section className="mb-10 bg-muted/30 p-5 rounded-lg border-l-4 border-primary">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Why This Matters</h3>
              <p className="text-foreground/90 italic">{lesson.whyItMatters}</p>
            </section>
          )}

          {/* Key Idea */}
          {lesson.keyIdea && (
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
          )}

          <Separator className="my-12" />

          {/* Deep Analysis (AI) */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-semibold">Deeper Analysis</h2>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">AI Interpretation</Badge>
            </div>
            
            <div className="space-y-8">
              {lesson.authorMeaning && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                    What the author really means
                  </h3>
                  <p className="text-foreground/80 text-lg leading-relaxed">{lesson.authorMeaning}</p>
                </div>
              )}

              {lesson.argumentMap && lesson.argumentMap.length > 0 && (
                <div className="bg-muted/10 p-5 rounded-lg border">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Logical Argument Map</h3>
                  <div className="space-y-2">
                    {lesson.argumentMap.map((step: string, i: number) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center mt-1">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </div>
                          {i < lesson.argumentMap.length - 1 && <div className="w-px h-full bg-border mt-1"></div>}
                        </div>
                        <div className="pb-4 pt-0.5 text-foreground/80">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lesson.assumptions && lesson.assumptions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Hidden Assumptions</h3>
                  <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                    {lesson.assumptions.map((a: string, i: number) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}

              {lesson.deepAnalysis && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Critical Evaluation</h3>
                  <p className="text-foreground/80 leading-relaxed">{lesson.deepAnalysis}</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
