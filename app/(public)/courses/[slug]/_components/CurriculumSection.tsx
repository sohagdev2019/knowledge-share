"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { Lock } from "lucide-react";
import { useState } from "react";

interface Lesson {
  id: string;
  title: string;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CurriculumSectionProps {
  chapters: Chapter[];
}

export function CurriculumSection({ chapters }: CurriculumSectionProps) {
  const [openChapters, setOpenChapters] = useState<Set<string>>(
    new Set([chapters[0]?.id])
  );

  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const formatDuration = () => {
    // Placeholder - replace with actual duration if available
    return "0s";
  };

  return (
    <div className="space-y-4">
      {chapters.map((chapter, index) => {
        const isOpen = openChapters.has(chapter.id);
        return (
          <Collapsible
            key={chapter.id}
            open={isOpen}
            onOpenChange={() => toggleChapter(chapter.id)}
          >
            <div className="border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md">
              <CollapsibleTrigger className="w-full">
                <div className="p-4 hover:bg-muted/50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-left transition-colors duration-200">
                      {chapter.title}
                    </h3>
                    <div className="transition-transform duration-300 ease-in-out transform">
                      {isOpen ? (
                        <IconChevronUp className="size-5 text-muted-foreground transition-all duration-300" />
                      ) : (
                        <IconChevronDown className="size-5 text-muted-foreground transition-all duration-300" />
                      )}
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <div className="border-t border-border bg-muted/20">
                  <div className="p-4 space-y-3">
                    {chapter.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 rounded-lg p-3 hover:bg-background transition-all duration-200 hover:shadow-sm animate-in fade-in slide-in-from-top-2"
                        style={{
                          animationDelay: isOpen ? `${lessonIndex * 50}ms` : "0ms",
                        }}
                      >
                        <Lock className="size-5 text-muted-foreground flex-shrink-0 transition-colors duration-200" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm transition-colors duration-200">{lesson.title}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDuration()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}

