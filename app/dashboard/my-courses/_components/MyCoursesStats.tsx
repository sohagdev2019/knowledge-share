"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconCheck,
  IconClock,
  IconFileText,
  IconCurrencyDollar,
  IconWallet,
} from "@tabler/icons-react";

type MyCoursesStatsProps = {
  stats: {
    active: number;
    pending: number;
    draft: number;
    free: number;
    paid: number;
  };
};

const statCards = [
  {
    key: "active",
    label: "Active Courses",
    icon: IconCheck,
    bgGradient: "from-emerald-500/10 via-green-500/5 to-transparent",
    iconBg: "bg-gradient-to-br from-emerald-500/20 to-green-600/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-500/20",
    shadowColor: "shadow-emerald-500/10",
  },
  {
    key: "pending",
    label: "Pending Courses",
    icon: IconClock,
    bgGradient: "from-pink-500/10 via-rose-500/5 to-transparent",
    iconBg: "bg-gradient-to-br from-pink-500/20 to-rose-600/10",
    iconColor: "text-pink-600 dark:text-pink-400",
    borderColor: "border-pink-500/20",
    shadowColor: "shadow-pink-500/10",
  },
  {
    key: "draft",
    label: "Draft Courses",
    icon: IconFileText,
    bgGradient: "from-purple-500/10 via-purple-500/5 to-transparent",
    iconBg: "bg-gradient-to-br from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-500/20",
    shadowColor: "shadow-purple-500/10",
  },
  {
    key: "free",
    label: "Free Courses",
    icon: IconCurrencyDollar,
    bgGradient: "from-blue-500/10 via-cyan-500/5 to-transparent",
    iconBg: "bg-gradient-to-br from-blue-500/20 to-cyan-600/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-500/20",
    shadowColor: "shadow-blue-500/10",
  },
  {
    key: "paid",
    label: "Paid Courses",
    icon: IconWallet,
    bgGradient: "from-amber-500/10 via-yellow-500/5 to-transparent",
    iconBg: "bg-gradient-to-br from-amber-500/20 to-yellow-600/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-500/20",
    shadowColor: "shadow-amber-500/10",
  },
] as const;

export function MyCoursesStats({ stats }: MyCoursesStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const value = stats[stat.key as keyof typeof stats];

        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: index * 0.05,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="h-full"
          >
            <Card
              className={`group relative h-full overflow-hidden border ${stat.borderColor} bg-gradient-to-br from-background/98 via-background/95 to-background/90 backdrop-blur-sm shadow-lg ${stat.shadowColor} transition-all duration-500 hover:border-opacity-40 hover:shadow-xl`}
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />

              <CardContent className="relative p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                      {stat.label}
                    </p>
                    <motion.p
                      className="text-2xl font-bold tracking-tight"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.25, duration: 0.4 }}
                    >
                      {value}
                    </motion.p>
                  </div>
                  <motion.div
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.iconBg} border border-white/10 backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}
                    whileHover={{
                      rotate: [0, -8, 8, -8, 0],
                      scale: 1.15,
                    }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <div
                      className={`absolute inset-0 rounded-xl bg-gradient-to-br ${stat.bgGradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                    />
                    <Icon
                      className={`relative h-5 w-5 ${stat.iconColor} drop-shadow-sm transition-all duration-300 group-hover:drop-shadow-md`}
                    />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

