"use server";

import { ProjectsPageClient } from "./_components/ProjectsPageClient";

const demoProjects = [
  {
    id: "1",
    name: "E-Learning Platform Redesign",
    description: "Complete redesign of the learning platform with modern UI/UX",
    status: "In Progress",
    progress: 65,
    teamMembers: 5,
    deadline: "March 15, 2025",
    priority: "High",
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Native mobile app for iOS and Android platforms",
    status: "Planning",
    progress: 20,
    teamMembers: 8,
    deadline: "May 30, 2025",
    priority: "Medium",
  },
  {
    id: "3",
    name: "API Integration Project",
    description: "Integrate third-party APIs for payment and analytics",
    status: "Completed",
    progress: 100,
    teamMembers: 3,
    deadline: "January 10, 2025",
    priority: "High",
  },
  {
    id: "4",
    name: "Content Management System",
    description: "Build a comprehensive CMS for course content management",
    status: "In Progress",
    progress: 45,
    teamMembers: 6,
    deadline: "April 20, 2025",
    priority: "Medium",
  },
  {
    id: "5",
    name: "Security Audit & Updates",
    description: "Comprehensive security audit and implementation of updates",
    status: "In Progress",
    progress: 80,
    teamMembers: 4,
    deadline: "February 28, 2025",
    priority: "High",
  },
  {
    id: "6",
    name: "Performance Optimization",
    description: "Optimize platform performance and loading times",
    status: "Planning",
    progress: 10,
    teamMembers: 2,
    deadline: "June 15, 2025",
    priority: "Low",
  },
];

export default async function SuperAdminProjectsPage() {
  // requireSuperAdmin is already called in layout, no need to call again
  return <ProjectsPageClient projects={demoProjects} />;
}
