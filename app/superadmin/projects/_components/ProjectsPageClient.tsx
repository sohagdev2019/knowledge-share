"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { IconPlus, IconUsers, IconCalendar, IconFlag } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  name: string;
  description: string;
  status: "In Progress" | "Planning" | "Completed" | "On Hold";
  progress: number;
  teamMembers: number;
  deadline: string;
  priority: "High" | "Medium" | "Low";
};

type ProjectsPageClientProps = {
  projects: readonly Project[];
};

export function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/20 text-emerald-600";
      case "In Progress":
        return "bg-blue-500/20 text-blue-600";
      case "Planning":
        return "bg-amber-500/20 text-amber-600";
      case "On Hold":
        return "bg-red-500/20 text-red-600";
      default:
        return "bg-gray-500/20 text-gray-600";
    }
  };

  const getPriorityColor = (priority: Project["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-red-500/20 text-red-600";
      case "Medium":
        return "bg-amber-500/20 text-amber-600";
      case "Low":
        return "bg-emerald-500/20 text-emerald-600";
      default:
        return "bg-gray-500/20 text-gray-600";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Projects
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and track all your active projects
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 py-6 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30">
            <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60 opacity-0 transition-opacity group-hover:opacity-100" />
            <IconPlus className="relative z-10 mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
            <span className="relative z-10">New Project</span>
          </Button>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: index * 0.1,
              duration: 0.4,
              type: "spring",
              stiffness: 200,
            }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <Card className="group relative h-full overflow-hidden border-border/60 bg-gradient-to-br from-background/98 via-background/95 to-background shadow-lg shadow-black/5 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="relative space-y-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl font-bold">{project.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1.5 rounded-full border-0 px-3 py-1 text-xs font-medium",
                      getPriorityColor(project.priority)
                    )}
                  >
                    <IconFlag className="h-3 w-3" />
                    {project.priority}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1.5 rounded-full border-0 px-3 py-1 text-xs font-medium",
                      getStatusColor(project.status)
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconUsers className="h-4 w-4" />
                    <span>{project.teamMembers} members</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconCalendar className="h-4 w-4" />
                    <span>{project.deadline}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

