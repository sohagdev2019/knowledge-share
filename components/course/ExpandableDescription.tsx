"use client";

import { Button } from "@/components/ui/button";
import { RenderDescription } from "@/components/rich-text-editor/RenderDescription";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ExpandableDescriptionProps {
  description: string | object; // Can be JSON string or object
  maxHeight?: string;
}

export function ExpandableDescription({
  description,
  maxHeight = "200px",
}: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse description if it's a string
  const descriptionJson =
    typeof description === "string"
      ? JSON.parse(description)
      : description;

  return (
    <section className="py-8 border-b">
      <h2 className="text-2xl font-bold mb-6">Description</h2>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-none" : `max-h-[${maxHeight}]`
        }`}
        style={{
          maxHeight: isExpanded ? "none" : maxHeight,
        }}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <RenderDescription json={descriptionJson} />
        </div>
      </div>
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-4"
      >
        {isExpanded ? (
          <>
            Show less
            <ChevronUp className="ml-2 size-4" />
          </>
        ) : (
          <>
            Show more
            <ChevronDown className="ml-2 size-4" />
          </>
        )}
      </Button>
    </section>
  );
}

