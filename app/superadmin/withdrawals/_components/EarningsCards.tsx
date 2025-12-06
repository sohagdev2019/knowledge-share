"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { IconCurrencyDollar, IconStar, IconUserCheck } from "@tabler/icons-react";

const earningsData = [
  {
    title: "Revenue",
    value: "$625",
    description: "Total earnings",
    icon: IconCurrencyDollar,
    gradientFrom: "from-emerald-500/20",
    gradientTo: "to-emerald-500/5",
    iconBg: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-500/20",
    shadowColor: "shadow-emerald-500/10",
  },
  {
    title: "Courses Ratings",
    value: "0.0",
    description: "Average rating",
    icon: IconStar,
    gradientFrom: "from-pink-500/20",
    gradientTo: "to-pink-500/5",
    iconBg: "bg-gradient-to-br from-pink-500/20 to-pink-600/10",
    iconColor: "text-pink-600 dark:text-pink-400",
    borderColor: "border-pink-500/20",
    shadowColor: "shadow-pink-500/10",
  },
  {
    title: "Students Enrolled",
    value: "13",
    description: "Total students",
    icon: IconUserCheck,
    gradientFrom: "from-purple-500/20",
    gradientTo: "to-purple-500/5",
    iconBg: "bg-gradient-to-br from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-500/20",
    shadowColor: "shadow-purple-500/10",
  },
];

export function EarningsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {earningsData.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: index * 0.1,
              duration: 0.5,
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="h-full"
          >
            <Card className="group relative h-full overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background/98 via-background/95 to-background transition-all duration-300 hover:border-primary/60 hover:bg-background">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradientFrom} via-transparent ${item.gradientTo} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <motion.p
                      className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                    >
                      {item.title}
                    </motion.p>
                    <motion.p
                      className="text-3xl font-bold tracking-tight"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: index * 0.1 + 0.3,
                        duration: 0.4,
                        type: "spring",
                      }}
                    >
                      {item.value}
                    </motion.p>
                    <p className="text-xs text-muted-foreground/70">
                      {item.description}
                    </p>
                  </div>
                  <motion.div
                    className={`relative flex h-14 w-14 items-center justify-center rounded-xl ${item.iconBg} border border-border/30 transition-all duration-500 group-hover:scale-110 group-hover:border-primary/50`}
                    whileHover={{
                      rotate: [0, -10, 10, -10, 0],
                      scale: 1.15,
                    }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <div
                      className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.gradientFrom} via-transparent ${item.gradientTo} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                    />
                    <Icon
                      className={`relative h-7 w-7 ${item.iconColor} transition-all duration-300`}
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

