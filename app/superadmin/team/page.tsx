"use server";

import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { TeamPageClient } from "./_components/TeamPageClient";

const demoTeamMembers = [
  {
    id: "1",
    name: "John Doe",
    role: "Lead Developer",
    email: "john.doe@example.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    status: "Active",
    projects: 5,
    joinDate: "January 2023",
  },
  {
    id: "2",
    name: "Jane Smith",
    role: "UI/UX Designer",
    email: "jane.smith@example.com",
    avatar: "https://i.pravatar.cc/150?img=5",
    status: "Active",
    projects: 3,
    joinDate: "March 2023",
  },
  {
    id: "3",
    name: "Mike Johnson",
    role: "Backend Developer",
    email: "mike.johnson@example.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    status: "Active",
    projects: 7,
    joinDate: "February 2023",
  },
  {
    id: "4",
    name: "Sarah Williams",
    role: "Product Manager",
    email: "sarah.williams@example.com",
    avatar: "https://i.pravatar.cc/150?img=9",
    status: "Active",
    projects: 4,
    joinDate: "April 2023",
  },
  {
    id: "5",
    name: "David Brown",
    role: "DevOps Engineer",
    email: "david.brown@example.com",
    avatar: "https://i.pravatar.cc/150?img=15",
    status: "Active",
    projects: 6,
    joinDate: "May 2023",
  },
  {
    id: "6",
    name: "Emily Davis",
    role: "Frontend Developer",
    email: "emily.davis@example.com",
    avatar: "https://i.pravatar.cc/150?img=20",
    status: "Active",
    projects: 4,
    joinDate: "June 2023",
  },
];

export default async function SuperAdminTeamPage() {
  await requireSuperAdmin();

  return <TeamPageClient teamMembers={demoTeamMembers} />;
}
