import { getCoursesByCategory } from "@/app/data/course/get-courses-by-category";
import { BrowsePageClient } from "./_components/BrowsePageClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// Map browse menu paths to actual category names
const categoryMap: Record<string, string> = {
  "web-development": "Development",
  "design": "Design",
  "mobile-app": "Development", // Mobile app courses are typically in Development
  "it-software": "IT & Software",
  "marketing": "Marketing",
  "music": "Music",
  "lifestyle": "Health & Fitness", // Map lifestyle to Health & Fitness
  "business": "Business",
  "photography": "Photography",
};

// Map subcategory names from URL to search terms
const subcategoryMap: Record<string, string> = {
  "javascript": "JavaScript",
  "react": "React",
  "vue": "Vue",
  "vue.js": "Vue",
  "angular": "Angular",
  "nodejs": "Node.js",
  "node.js": "Node.js",
  "python": "Python",
  "graphic-design": "Graphic Design",
  "illustrator": "Illustrator",
  "ux-ui-design": "UX/UI Design",
  "ux/ui-design": "UX/UI Design",
  "figma-design": "Figma",
  "adobe-xd": "Adobe XD",
  "sketch": "Sketch",
  "icon-design": "Icon Design",
  "photoshop": "Photoshop",
};

interface BrowsePageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function BrowsePage({ params }: BrowsePageProps) {
  const { slug } = await params;
  const [categorySlug, subcategorySlug] = slug || [];

  // Map URL slug to category
  const category = categorySlug ? categoryMap[categorySlug] : undefined;
  
  // If category doesn't exist in map, return 404
  if (categorySlug && !category) {
    return notFound();
  }

  // Map subcategory slug to search term
  const subcategory = subcategorySlug
    ? subcategoryMap[subcategorySlug] || subcategorySlug
    : undefined;

  // Get courses filtered by category and optionally subcategory
  const courses = await getCoursesByCategory({
    category,
    subcategory,
  });

  // Generate page title
  let pageTitle = "Browse Courses";
  if (subcategory) {
    pageTitle = subcategory;
  } else if (category) {
    pageTitle = category;
  }

  return (
    <BrowsePageClient
      initialCourses={courses}
      category={category}
      subcategory={subcategory}
      pageTitle={pageTitle}
    />
  );
}

