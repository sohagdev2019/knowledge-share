"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconPencil, IconTrash } from "@tabler/icons-react";

type AnnouncementStatus = "Published" | "Draft" | "Archived";

type Announcement = {
  id: string;
  date: string;
  title: string;
  courseName: string;
  status: AnnouncementStatus;
};

type AnnouncementsTableProps = {
  announcements: readonly Announcement[];
};

export function AnnouncementsTable({ announcements }: AnnouncementsTableProps) {
  const [filteredAnnouncements] = useState(announcements);

  const handleEdit = (id: string) => {
    console.log("Edit announcement:", id);
    // TODO: Implement edit functionality
  };

  const handleDelete = (id: string) => {
    console.log("Delete announcement:", id);
    // TODO: Implement delete functionality
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
      className="group relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background/98 via-background/95 to-background shadow-lg shadow-black/5 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold text-foreground">Date</TableHead>
              <TableHead className="font-semibold text-foreground">Announcements</TableHead>
              <TableHead className="font-semibold text-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAnnouncements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No announcements found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAnnouncements.map((announcement, index) => (
                <TableRow
                  key={announcement.id}
                  className="border-border/30 transition-all duration-300 hover:bg-muted/20 hover:shadow-sm"
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <TableCell className="text-muted-foreground">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
                    >
                      {announcement.date}
                    </motion.span>
                  </TableCell>
                  <TableCell>
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 + 0.15, duration: 0.3 }}
                      className="space-y-1"
                    >
                      <p className="font-semibold text-foreground transition-colors group-hover:text-primary">
                        {announcement.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Course: {announcement.courseName}
                      </p>
                    </motion.div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05 + 0.2, duration: 0.3, type: "spring" }}
                      >
                        <Badge
                          variant="outline"
                          className="gap-1.5 rounded-full border-0 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-600 transition-all hover:bg-emerald-500/30 hover:scale-105"
                        >
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          {announcement.status}
                        </Badge>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + 0.25, duration: 0.3 }}
                        className="flex items-center gap-1"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full border border-border/50 text-muted-foreground transition-all hover:scale-110 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                          onClick={() => handleEdit(announcement.id)}
                        >
                          <IconPencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full border border-border/50 text-muted-foreground transition-all hover:scale-110 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                          onClick={() => handleDelete(announcement.id)}
                        >
                          <IconTrash className="size-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}

