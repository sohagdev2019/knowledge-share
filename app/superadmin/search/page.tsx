"use server";

import { SearchPageClient } from "./_components/SearchPageClient";

const demoResults = [
  {
    id: "course-1",
    type: "Course",
    title: "Complete HTML, CSS and Javascript Course",
    description: "A step-by-step guide to build responsive, accessible websites.",
    matches: ["category: Web Development", "level: Beginner"],
  },
  {
    id: "student-1",
    type: "Student",
    title: "Jane Smith",
    description: "Active learner enrolled in 6 courses",
    matches: ["status: Active", "last login: 2 hours ago"],
  },
  {
    id: "order-1",
    type: "Order",
    title: "Order #3015",
    description: "Advanced React with Redux Course • $50.00",
    matches: ["status: Completed", "date: Nov 28, 2024"],
  },
];

export default async function SuperAdminSearchPage() {
  // requireSuperAdmin is already called in layout, no need to call again
  return <SearchPageClient demoResults={demoResults} />;
}
