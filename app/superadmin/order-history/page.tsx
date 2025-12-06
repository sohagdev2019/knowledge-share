"use server";

import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { OrderHistoryTable } from "@/app/dashboard/orders/_components/OrderHistoryTable";

const demoOrders = [
  {
    id: "#4343",
    date: "August 29, 2025",
    amount: 11,
    status: "Completed" as const,
    courseName: "Learn JavaScript and Express to become a professional JavaScript",
  },
  {
    id: "#3707",
    date: "August 11, 2025",
    amount: 11,
    status: "Completed" as const,
    courseName: "Complete HTML, CSS and Javascript Course",
  },
  {
    id: "#3015",
    date: "November 28, 2024",
    amount: 50,
    status: "Completed" as const,
    courseName: "Advanced React with Redux Course",
  },
  {
    id: "#2643",
    date: "March 24, 2023",
    amount: 34,
    status: "On Hold" as const,
    courseName: "Angular with Nodejs Fullstack Development",
  },
  {
    id: "#2614",
    date: "March 17, 2023",
    amount: 11,
    status: "On Hold" as const,
    courseName: "REST APIs with Flask and Python Developer Course",
  },
  {
    id: "#1652",
    date: "January 30, 2023",
    amount: 590,
    status: "Completed" as const,
    courseName: "iOS & Swift Complete iOS Application Development Course",
  },
  {
    id: "#1500",
    date: "January 15, 2023",
    amount: 25,
    status: "Pending" as const,
    courseName: "AWS Certified Solutions Architect - Associate 2023",
  },
  {
    id: "#1400",
    date: "December 1, 2022",
    amount: 15,
    status: "Cancelled" as const,
    courseName: "Docker and Kubernetes: The Complete Guide",
  },
];

export default async function SuperAdminOrderHistoryPage() {
  await requireSuperAdmin();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
          <p className="text-muted-foreground">
            View and manage all course purchase orders across the platform.
          </p>
        </div>
      </div>

      <OrderHistoryTable orders={demoOrders} />
    </div>
  );
}
