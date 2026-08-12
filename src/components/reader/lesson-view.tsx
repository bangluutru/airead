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
    <div className="max-w-2xl mx-auto py-12 px-6 pb-32">
      {/* Lesson Header */}
      <header className="mb-10">
        <div className="flex items-center gap-2 text-sm font-medium text-accent mb-4 font-sans">
          <span className="uppercase tracking-wider">Lesson {lesson.sequence}</span>
          <span>•</span>
          <span>{lesson.estimatedMinutes} min read</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground leading-tight font-serif">{lesson.title}</h1>
        <p className="text-xl text-muted-foreground font-sans">{lesson.chapter}</p>
      </header>

      {/* Read Section */}
      <section className="mb-16">
        <div className="prose prose-lg md:prose-xl max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap font-serif">
          {lesson.read}
        </div>
      </section>

      {!lesson.isAnalyzed ? (
        <section className="mb-12 text-center bg-accent/5 p-10 rounded-2xl border border-accent/20 font-sans">
          <Sparkles className="w-10 h-10 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3 text-foreground">Deep Reading AI Analysis</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
            Use AI to extract the core thesis, understand the author's hidden assumptions, and map the underlying arguments.
          </p>
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            size="lg"
            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-6 rounded-xl transition-all duration-200"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing (10-20s)...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate AI Insights
              </>
            )}
          </Button>
          {error && <p className="text-destructive mt-4 text-sm font-medium">{error}</p>}
        </section>
      ) : (
        <>
          {/* Why This Matters */}
          {lesson.whyItMatters && (
            <section className="mb-12 bg-accent/10 p-6 md:p-8 rounded-2xl border-l-4 border-accent font-sans">
              <h3 className="text-sm font-bold uppercase tracking-widest text-accent mb-3">Why This Matters</h3>
              <p className="text-foreground text-lg md:text-xl font-medium leading-relaxed font-serif">{lesson.whyItMatters}</p>
            </section>
          )}

          {/* Key Idea */}
          {lesson.keyIdea && (
            <section className="mb-12 font-sans">
              <div className="bg-background border-2 border-border/60 rounded-2xl p-6 md:p-8">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent text-lg">💡</span> 
                  <span className="text-xl">Key Takeaway</span>
                </h3>
                <p className="text-lg md:text-xl text-foreground/90 leading-relaxed font-serif">{lesson.keyIdea}</p>
              </div>
            </section>
          )}

          <Separator className="my-16 opacity-50" />

          {/* Deep Analysis (AI) */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-10">
              <Sparkles className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold text-foreground">Deeper Analysis</h2>
            </div>
            
            <div className="space-y-12 font-sans">
              {lesson.authorMeaning && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    What the author really means
                  </h3>
                  <p className="text-foreground/90 text-lg md:text-xl leading-relaxed font-serif">{lesson.authorMeaning}</p>
                </div>
              )}

              {lesson.argumentMap && lesson.argumentMap.length > 0 && (
                <div className="bg-muted/30 p-6 md:p-8 rounded-2xl border border-border/50">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Logical Argument Map</h3>
                  <div className="space-y-4">
                    {lesson.argumentMap.map((step: string, i: number) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center mt-1">
                          <div className="w-8 h-8 rounded-full bg-background border-2 border-accent text-accent flex items-center justify-center text-sm font-bold shadow-sm">
                            {i + 1}
                          </div>
                          {i < lesson.argumentMap.length - 1 && <div className="w-0.5 h-full bg-accent/20 mt-2"></div>}
                        </div>
                        <div className="pb-6 pt-1 text-foreground/90 text-lg leading-relaxed font-serif">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lesson.assumptions && lesson.assumptions.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Hidden Assumptions</h3>
                  <ul className="list-disc pl-6 space-y-3 text-foreground/90 text-lg md:text-xl leading-relaxed font-serif">
                    {lesson.assumptions.map((a: string, i: number) => <li key={i} className="pl-2">{a}</li>)}
                  </ul>
                </div>
              )}

              {lesson.deepAnalysis && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Critical Evaluation</h3>
                  <p className="text-foreground/90 text-lg md:text-xl leading-relaxed font-serif">{lesson.deepAnalysis}</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
