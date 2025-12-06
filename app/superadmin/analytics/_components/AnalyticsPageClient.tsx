"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartAreaInteractive } from "@/components/sidebar/chart-area-interactive";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconBook,
  IconShoppingCart,
  IconPlaylistX,
} from "@tabler/icons-react";

type EnrollmentData = Array<{
  date: string;
  enrollments: number;
}>;

type DashboardStats = {
  totalCourses: number;
  totalCustomers: number;
  totalLessons: number;
  totalSignups: number;
};

type AnalyticsPageClientProps = {
  enrollmentData: EnrollmentData;
  dashboardStats: DashboardStats;
};

export function AnalyticsPageClient({
  enrollmentData,
  dashboardStats,
}: AnalyticsPageClientProps) {
  const stats = [
    {
      label: "Total Signups",
      value: dashboardStats.totalSignups,
      icon: IconUsers,
      trend: "+12.5%",
      trendUp: true,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Total Courses",
      value: dashboardStats.totalCourses,
      icon: IconBook,
      trend: "+8.2%",
      trendUp: true,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Total Customers",
      value: dashboardStats.totalCustomers,
      icon: IconShoppingCart,
      trend: "+15.3%",
      trendUp: true,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Total Lessons",
      value: dashboardStats.totalLessons,
      icon: IconPlaylistX,
      trend: "+5.7%",
      trendUp: true,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your platform performance and user engagement metrics
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 100 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.2 + index * 0.1,
                duration: 0.4,
                type: "spring",
                stiffness: 200,
              }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <Card className="group relative overflow-hidden border-border/60 bg-gradient-to-br from-background/98 via-background/95 to-background shadow-lg shadow-black/5 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardDescription>{stat.label}</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums">
                      {stat.value}
                    </CardTitle>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex items-center gap-2 text-sm">
                    {stat.trendUp ? (
                      <IconTrendingUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <IconTrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={stat.trendUp ? "text-emerald-600" : "text-red-600"}>
                      {stat.trend}
                    </span>
                    <span className="text-muted-foreground">from last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <ChartAreaInteractive data={enrollmentData} />
      </motion.div>
    </motion.div>
  );
}

