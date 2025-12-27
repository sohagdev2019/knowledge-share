"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Clock, Lock } from "lucide-react";
import { useState } from "react";

interface Lesson {
  id: string;
  title: string;
  duration?: string;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
  duration?: string;
}

interface CourseContentAccordionProps {
  sections: Section[];
}

export function CourseContentAccordion({
  sections,
}: CourseContentAccordionProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  const totalSections = sections.length;
  const totalLessons = sections.reduce(
    (sum, section) => sum + section.lessons.length,
    0
  );
  const totalDuration = sections.reduce((sum, section) => {
    // Parse duration if available, otherwise estimate
    return sum + (section.lessons.length * 10); // 10 minutes per lesson estimate
  }, 0);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedItems([]);
      setIsAllExpanded(false);
    } else {
      setExpandedItems(sections.map((s) => s.id));
      setIsAllExpanded(true);
    }
  };

  return (
    <section className="py-8 border-b">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Course content</h2>
          <p className="text-sm text-muted-foreground">
            {totalSections} sections • {totalLessons} lectures •{" "}
            {formatDuration(totalDuration)} total length
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAll}
          className="hidden md:flex"
        >
          {isAllExpanded ? "Collapse all" : "Expand all"}
        </Button>
      </div>

      <Accordion
        type="multiple"
        value={expandedItems}
        onValueChange={setExpandedItems}
        className="w-full"
      >
        {sections.map((section, sectionIndex) => (
          <AccordionItem key={section.id} value={section.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Section {sectionIndex + 1}:
                    </span>
                    <span className="font-semibold">{section.title}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{section.lessons.length} lectures</span>
                  {section.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="size-4" />
                      <span>{section.duration}</span>
                    </div>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {section.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Lock className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {lessonIndex + 1}. {lesson.title}
                      </span>
                    </div>
                    {lesson.duration && (
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {lesson.duration}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

