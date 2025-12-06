"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconPlus, IconMail, IconCalendar, IconBriefcase, IconCircle } from "@tabler/icons-react";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  status: "Active" | "Inactive" | "Away";
  projects: number;
  joinDate: string;
};

type TeamPageClientProps = {
  teamMembers: readonly TeamMember[];
};

export function TeamPageClient({ teamMembers }: TeamPageClientProps) {
  const getStatusColor = (status: TeamMember["status"]) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500";
      case "Inactive":
        return "bg-gray-500";
      case "Away":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
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
            Team
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your team members and their roles
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
            <span className="relative z-10">Add Member</span>
          </Button>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.id}
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
              <CardContent className="relative p-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="text-lg font-semibold">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0">
                      <div
                        className={`h-4 w-4 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="gap-1.5 rounded-full border-0 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-600"
                      >
                        <IconCircle className="h-2 w-2 fill-current" />
                        {member.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <IconMail className="h-4 w-4" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <IconBriefcase className="h-4 w-4" />
                          <span>{member.projects} projects</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <IconCalendar className="h-4 w-4" />
                          <span>{member.joinDate}</span>
                        </div>
                      </div>
                    </div>
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

