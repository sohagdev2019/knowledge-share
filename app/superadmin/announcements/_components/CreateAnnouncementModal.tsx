"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconSearch, IconX } from "@tabler/icons-react";

type Course = {
  id: string;
  title: string;
};

type CreateAnnouncementModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: readonly Course[];
};

export function CreateAnnouncementModal({
  open,
  onOpenChange,
  courses,
}: CreateAnnouncementModalProps) {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) {
      return courses;
    }
    const query = searchQuery.toLowerCase();
    return courses.filter((course) =>
      course.title.toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const handlePublish = () => {
    if (!selectedCourseId || !title.trim() || !summary.trim()) {
      return;
    }
    console.log("Publish announcement:", {
      courseId: selectedCourseId,
      title,
      summary,
    });
    // TODO: Implement publish functionality
    handleClose();
  };

  const handleClose = () => {
    setSelectedCourseId("");
    setTitle("");
    setSummary("");
    setSearchQuery("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <AnimatePresence>
        {open && (
          <DialogContent className="max-w-2xl border-border/50 bg-gradient-to-br from-background/98 via-background/95 to-background p-0 shadow-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
              className="relative p-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />
              <DialogHeader className="relative space-y-2 text-left">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    Create Announcement
                  </DialogTitle>
                </motion.div>
              </DialogHeader>

              <div className="relative mt-6 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4, type: "spring" }}
                  className="space-y-2"
                >
                  <Label htmlFor="course" className="text-sm font-semibold">
                    Select Course
                  </Label>
                  <Select
                    value={selectedCourseId}
                    onValueChange={setSelectedCourseId}
                  >
                    <SelectTrigger
                      id="course"
                      className="h-12 w-full transition-all hover:border-primary/50 focus:border-primary"
                    >
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <div className="sticky top-0 z-10 border-b border-border/50 bg-background p-2">
                        <div className="relative">
                          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 pl-9 pr-8"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => setSearchQuery("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-muted"
                            >
                              <IconX className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto">
                        {filteredCourses.length === 0 ? (
                          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                            No courses found
                          </div>
                        ) : (
                          filteredCourses.map((course) => (
                            <SelectItem
                              key={course.id}
                              value={course.id}
                              className="cursor-pointer"
                            >
                              {course.title}
                            </SelectItem>
                          ))
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
                  className="space-y-2"
                >
                  <Label htmlFor="title" className="text-sm font-semibold">
                    Announcement Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter announcement title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-12 transition-all hover:border-primary/50 focus:border-primary"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4, type: "spring" }}
                  className="space-y-2"
                >
                  <Label htmlFor="summary" className="text-sm font-semibold">
                    Summary
                  </Label>
                  <Textarea
                    id="summary"
                    placeholder="Enter announcement summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={4}
                    className="resize-none transition-all hover:border-primary/50 focus:border-primary"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
                  className="flex gap-3 pt-4"
                >
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="group flex-1 rounded-lg border-red-500/50 bg-background px-6 py-6 text-base font-semibold text-red-600 transition-all hover:scale-105 hover:bg-red-50 hover:shadow-lg hover:shadow-red-500/20 dark:hover:bg-red-950/20"
                  >
                    <span className="relative z-10">Cancel</span>
                  </Button>
                  <Button
                    onClick={handlePublish}
                    disabled={!selectedCourseId || !title.trim() || !summary.trim()}
                    className="group relative flex-1 overflow-hidden rounded-lg bg-red-600 px-6 py-6 text-base font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105 hover:bg-red-700 hover:shadow-xl hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span className="relative z-10">Publish</span>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}

