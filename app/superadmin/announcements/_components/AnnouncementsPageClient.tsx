"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { AnnouncementsTable } from "./AnnouncementsTable";
import { AnnouncementsFilters } from "./AnnouncementsFilters";
import { CreateAnnouncementModal } from "./CreateAnnouncementModal";

type Announcement = {
  id: string;
  date: string;
  title: string;
  courseName: string;
  status: "Published" | "Draft" | "Archived";
};

type Course = {
  id: string;
  title: string;
};

type AnnouncementsPageClientProps = {
  announcements: readonly Announcement[];
  courses: readonly Course[];
};

export function AnnouncementsPageClient({
  announcements,
  courses,
}: AnnouncementsPageClientProps) {
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [sortBy, setSortBy] = useState("DESC");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            Announcements
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and create announcements for your courses
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => setIsModalOpen(true)}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-6 text-base font-semibold text-white shadow-lg shadow-pink-500/25 transition-all hover:scale-105 hover:from-pink-700 hover:to-rose-700 hover:shadow-xl hover:shadow-pink-500/30"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 transition-opacity group-hover:opacity-100" />
            <IconPlus className="relative z-10 mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
            <span className="relative z-10">Add Announcement</span>
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <AnnouncementsFilters
          selectedCourse={selectedCourse}
          onCourseChange={setSelectedCourse}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <AnnouncementsTable announcements={announcements} />
      </motion.div>

      <CreateAnnouncementModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        courses={courses}
      />
    </motion.div>
  );
}

