import { Check } from "lucide-react";

interface LearningObjectivesProps {
  objectives: string[];
}

export function LearningObjectives({ objectives }: LearningObjectivesProps) {
  // Split objectives into two columns
  const midPoint = Math.ceil(objectives.length / 2);
  const leftColumn = objectives.slice(0, midPoint);
  const rightColumn = objectives.slice(midPoint);

  return (
    <section className="py-8 border-b">
      <h2 className="text-2xl font-bold mb-6">What you'll learn</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ul className="space-y-3">
          {leftColumn.map((objective, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <span className="text-sm leading-relaxed">{objective}</span>
            </li>
          ))}
        </ul>
        <ul className="space-y-3">
          {rightColumn.map((objective, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <span className="text-sm leading-relaxed">{objective}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

