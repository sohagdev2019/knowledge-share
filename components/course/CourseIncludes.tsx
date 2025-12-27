import { Check, Video, FileText, Download, Infinity } from "lucide-react";

interface CourseIncludesProps {
  includes: string[];
}

const iconMap: Record<string, React.ReactNode> = {
  video: <Video className="size-5" />,
  articles: <FileText className="size-5" />,
  resources: <Download className="size-5" />,
  lifetime: <Infinity className="size-5" />,
};

export function CourseIncludes({ includes }: CourseIncludesProps) {
  // Default includes if none provided
  const defaultIncludes = [
    "X hours on-demand video",
    "X downloadable resources",
    "Full lifetime access",
    "Access on mobile and TV",
    "Certificate of completion",
  ];

  const itemsToShow = includes.length > 0 ? includes : defaultIncludes;

  return (
    <section className="py-8 border-b">
      <h2 className="text-2xl font-bold mb-6">This course includes:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {itemsToShow.map((item, index) => {
          // Try to match icon based on keywords
          let icon = <Check className="size-5" />;
          const lowerItem = item.toLowerCase();
          if (lowerItem.includes("video")) icon = iconMap.video;
          else if (lowerItem.includes("article") || lowerItem.includes("resource"))
            icon = iconMap.articles;
          else if (lowerItem.includes("download")) icon = iconMap.resources;
          else if (lowerItem.includes("lifetime")) icon = iconMap.lifetime;

          return (
            <div key={index} className="flex items-center gap-3">
              <div className="text-green-600 dark:text-green-400 shrink-0">
                {icon}
              </div>
              <span className="text-sm">{item}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

