"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconBell, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import parse from "html-react-parser";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Announcement = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  publishedAt: string | null;
  isUrgent: boolean;
  isRead: boolean;
  readAt: string | null;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    image: string | null;
  };
  targetCourse: {
    id: string;
    title: string;
    slug: string;
  } | null;
  attachmentKeys: string[];
};

type StudentAnnouncementsClientProps = {
  initialAnnouncements: Announcement[];
};

export function StudentAnnouncementsClient({
  initialAnnouncements,
}: StudentAnnouncementsClientProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const router = useRouter();

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/announcements/${id}/read`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to mark as read");

      // Update local state
      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann.id === id ? { ...ann, isRead: true, readAt: new Date().toISOString() } : ann
        )
      );

      if (selectedAnnouncement?.id === id) {
        setSelectedAnnouncement((prev) =>
          prev ? { ...prev, isRead: true, readAt: new Date().toISOString() } : null
        );
      }
    } catch (error) {
      toast.error("Failed to mark announcement as read");
    }
  };

  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    if (!announcement.isRead) {
      markAsRead(announcement.id);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const unreadCount = announcements.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with the latest news and updates
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="default" className="text-sm px-3 py-1">
            {unreadCount} New
          </Badge>
        )}
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <IconBell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No announcements yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement, index) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  announcement.isUrgent
                    ? "border-red-500 bg-red-50/50 dark:bg-red-950/10"
                    : ""
                } ${!announcement.isRead ? "border-primary" : ""}`}
                onClick={() => handleViewAnnouncement(announcement)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        {announcement.isUrgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                        {!announcement.isRead && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {announcement.createdBy.firstName}{" "}
                          {announcement.createdBy.lastName || ""}
                        </span>
                        <span>•</span>
                        <span>{formatDate(announcement.publishedAt || announcement.createdAt)}</span>
                        {announcement.targetCourse && (
                          <>
                            <span>•</span>
                            <span>{announcement.targetCourse.title}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {announcement.isRead && (
                      <IconCheck className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert prose-sm max-w-none">
                    {parse(announcement.body.substring(0, 200))}
                    {announcement.body.length > 200 && "..."}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog
        open={selectedAnnouncement !== null}
        onOpenChange={(open) => !open && setSelectedAnnouncement(null)}
      >
        {selectedAnnouncement && (
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-2xl">{selectedAnnouncement.title}</DialogTitle>
                {selectedAnnouncement.isUrgent && (
                  <Badge variant="destructive">Urgent</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span>
                  {selectedAnnouncement.createdBy.firstName}{" "}
                  {selectedAnnouncement.createdBy.lastName || ""}
                </span>
                <span>•</span>
                <span>
                  {formatDate(selectedAnnouncement.publishedAt || selectedAnnouncement.createdAt)}
                </span>
                {selectedAnnouncement.targetCourse && (
                  <>
                    <span>•</span>
                    <span>{selectedAnnouncement.targetCourse.title}</span>
                  </>
                )}
              </div>
            </DialogHeader>
            <div className="prose dark:prose-invert max-w-none mt-4">
              {parse(selectedAnnouncement.body)}
            </div>
            {selectedAnnouncement.attachmentKeys.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-semibold mb-2">Attachments:</p>
                <div className="space-y-2">
                  {selectedAnnouncement.attachmentKeys.map((key, idx) => (
                    <a
                      key={idx}
                      href={`/api/s3/download?key=${key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-primary hover:underline"
                    >
                      Attachment {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedAnnouncement(null)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}











