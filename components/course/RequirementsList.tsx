import { CheckCircle } from "lucide-react";

interface RequirementsListProps {
  requirements: string[];
}

export function RequirementsList({ requirements }: RequirementsListProps) {
  // Default requirements if none provided
  const defaultRequirements = [
    "No prior knowledge required",
    "Basic computer skills",
    "Internet connection",
  ];

  const itemsToShow = requirements.length > 0 ? requirements : defaultRequirements;

  return (
    <section className="py-8 border-b">
      <h2 className="text-2xl font-bold mb-6">Requirements</h2>
      <ul className="space-y-3">
        {itemsToShow.map((requirement, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <span className="text-sm leading-relaxed">{requirement}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

