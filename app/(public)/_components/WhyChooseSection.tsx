"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Play, Zap, Clock, TrendingUp } from "lucide-react";

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  status: "active" | "completed" | "in-progress";
  time?: string;
  progress?: number;
}

export default function WhyChooseSection() {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [activities] = useState<ActivityItem[]>([
    {
      id: "1",
      title: "React Mastery Course",
      subtitle: "Advanced React Patterns",
      status: "active",
      time: "2m ago",
      progress: 85,
    },
    {
      id: "2",
      title: "JavaScript Fundamentals",
      subtitle: "Lesson 5: Async Programming",
      status: "in-progress",
      time: "5m ago",
      progress: 60,
    },
    {
      id: "3",
      title: "Full Stack Development",
      subtitle: "Course Completed",
      status: "completed",
      time: "1h ago",
      progress: 100,
    },
  ]);

  const [stats, setStats] = useState({
    avgCompletion: "2.4h",
    activeLearners: 1247,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        activeLearners: prev.activeLearners + Math.floor(Math.random() * 3),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: ActivityItem["status"]) => {
    switch (status) {
      case "active":
        return <Play className="w-3.5 h-3.5 text-white" />;
      case "completed":
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case "in-progress":
        return <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getStatusBg = (status: ActivityItem["status"]) => {
    switch (status) {
      case "active":
        return "bg-emerald-500";
      case "completed":
        return "bg-emerald-100 dark:bg-emerald-900";
      case "in-progress":
        return "bg-blue-100 dark:bg-blue-900";
    }
  };

  const getStatusText = (status: ActivityItem["status"]) => {
    switch (status) {
      case "active":
        return "Learning";
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
    }
  };

  const getStatusTextColor = (status: ActivityItem["status"]) => {
    switch (status) {
      case "active":
        return "text-emerald-600 dark:text-emerald-400";
      case "completed":
        return "text-emerald-600 dark:text-emerald-400";
      case "in-progress":
        return "text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <>
      <section className="pt-20 pb-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">
            Why choose our platform?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Everything you need to learn, grow, and master new skills at your own pace.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                Learn at your own pace
              </h2>
              <p className="text-muted-foreground mb-6">
                Our comprehensive learning platform ensures you can access courses
                anytime, anywhere. Track your progress, earn certificates, and advance
                your career with expert-led courses.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  99.9% course completion rate
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Self-paced learning with lifetime access
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Real-time progress tracking
                </li>
              </ul>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-border/50 p-4 h-80 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Live Learning Activity
                  </span>
                </div>
              </div>
              <div className="space-y-2 py-3 flex-1 overflow-y-auto">
                {activities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity.id === selectedActivity ? null : activity.id)}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg transition-all duration-300 cursor-pointer ${
                      selectedActivity === activity.id
                        ? "bg-emerald-50 dark:bg-emerald-950/50 ring-1 ring-emerald-200 dark:ring-emerald-800 scale-[1.02]"
                        : activity.status === "active"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 ring-1 ring-emerald-200 dark:ring-emerald-800"
                        : "bg-white dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-all duration-300 ${getStatusBg(
                        activity.status
                      )}`}
                    >
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[13px] font-medium truncate">
                        {activity.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {activity.subtitle}
                      </p>
                      {activity.progress && activity.status === "in-progress" && (
                        <div className="mt-1.5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                            style={{ width: `${activity.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] font-medium shrink-0 min-w-[60px] text-right transition-all duration-300">
                      {activity.status === "active" ? (
                        <span className={`inline-flex items-center gap-1 ${getStatusTextColor(activity.status)}`}>
                          <Zap className="w-3 h-3" />
                          {activity.time}
                        </span>
                      ) : (
                        <span className={getStatusTextColor(activity.status)}>
                          {getStatusText(activity.status)}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div>
                    <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                      {stats.avgCompletion}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Avg. completion
                    </p>
                  </div>
                  <div>
                    <p className="text-base font-semibold tabular-nums transition-all duration-300">
                      {stats.activeLearners.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Active learners
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
