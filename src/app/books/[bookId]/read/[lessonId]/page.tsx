import { LessonView } from "@/components/reader/lesson-view";
export const runtime = "edge";

// In a real app, this would fetch the lesson data from the database based on params.lessonId
export default async function ReadLessonPage({ params }: { params: Promise<{ bookId: string; lessonId: string }> }) {
  const { bookId, lessonId } = await params;
  
  // Mock data for Phase 1 UI showcase
  const mockLesson = {
    id: lessonId,
    chapter: "Chapter 3 — How Habits Shape Identity",
    sequence: 2,
    title: "Identity Before Behavior",
    estimatedMinutes: 5,
    whyItMatters: "Until this point the author has explained how habits form. This lesson introduces a deeper claim: lasting behavioral change depends on identity, not merely goals.",
    read: "The key to building lasting habits is focusing on creating a new identity first. Your current behaviors are simply a reflection of your current identity. What you do now is a mirror image of the type of person you believe that you are (either consciously or subconsciously). To change your behavior for good, you need to start believing new things about yourself. You need to build identity-based habits. With outcome-based habits, the focus is on what you want to achieve. With identity-based habits, the focus is on who you wish to become.",
    keyIdea: "Behavioral change is an inside-out process. You must decide the type of person you want to be and prove it to yourself with small wins.",
    quotes: [
      {
        quote: "True behavior change is identity change. You might start a habit because of motivation, but the only reason you'll stick with one is that it becomes part of your identity.",
        reasonSelected: "Captures the core thesis of the chapter perfectly.",
        sourceChunkId: "chunk_123"
      }
    ],
    authorMeaning: "The author is arguing against the common cultural narrative of goal-setting. He believes goals (outcomes) are fragile because they don't change the underlying belief system of the person acting.",
    argumentMap: [
      "Observation",
      "Repeated behavior shapes evidence about identity",
      "Evidence accumulates",
      "Self-perception changes",
      "Future behavior becomes more consistent with identity"
    ],
    deepAnalysis: "The logical strength here is robust because it aligns with cognitive dissonance theory—humans want their actions to match their self-image. However, a boundary condition exists: if a person has deep psychological trauma related to their identity, simply 'deciding' to be someone else via small habits may not overcome clinical barriers.",
    assumptions: [
      "The author assumes individuals have the agency to consciously select their desired identity.",
      "Assumes that small actions are sufficient to rewrite deeply ingrained self-beliefs."
    ]
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Navigation (Mocked) */}
      <aside className="w-64 border-r bg-muted/10 hidden md:block overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="font-semibold truncate">Atomic Habits</h2>
          <p className="text-sm text-muted-foreground">James Clear</p>
        </div>
        <div className="p-4 space-y-2 text-sm">
          <div className="font-medium">Chapter 3</div>
          <div className="pl-4 text-muted-foreground border-l-2 border-transparent hover:border-primary cursor-pointer py-1">3.1 The Three Layers of Change</div>
          <div className="pl-4 text-primary font-medium border-l-2 border-primary py-1">3.2 Identity Before Behavior</div>
          <div className="pl-4 text-muted-foreground border-l-2 border-transparent hover:border-primary cursor-pointer py-1">3.3 The Two-Step Process</div>
        </div>
      </aside>

      {/* Main Reading Area */}
      <main className="flex-1 overflow-y-auto">
        <LessonView lesson={mockLesson} />
      </main>

      {/* Right Sidebar - Tools (Mocked) */}
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
