"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSession } from "next-auth/react";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  body: z.string().min(1, "Body is required").optional(),
  targetRole: z.enum(["AllStudents", "AllTeachers", "AllUsers", "SpecificStudents", "SpecificTeachers", "CourseStudents"]).optional(),
  targetCourseId: z.string().optional().nullable(),
  targetUserIds: z.array(z.string()).optional(),
  scheduledAt: z.string().optional().nullable(),
  isUrgent: z.boolean().optional(),
  status: z.enum(["Draft", "Scheduled", "Published", "Expired"]).optional(),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

type EditAnnouncementModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcementId: string;
  onSuccess?: () => void;
};

export function EditAnnouncementModal({
  open,
  onOpenChange,
  announcementId,
  onSuccess,
}: EditAnnouncementModalProps) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const isSuperadmin = userRole === "superadmin";

  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
  });

  // Fetch announcement data
  useEffect(() => {
    if (open && announcementId) {
      setIsLoading(true);
      fetch(`/api/announcements/${announcementId}`)
        .then((res) => res.json())
        .then((data) => {
          setInitialData(data);
          // TipTap can parse HTML directly, so we pass the HTML string
          // The editor will convert it to JSON internally
          form.reset({
            title: data.title,
            body: data.body, // This is HTML from the database
            targetRole: data.targetRole,
            targetCourseId: data.targetCourseId,
            targetUserIds: data.targetUserIds,
            scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString().slice(0, 16) : null,
            isUrgent: data.isUrgent,
            status: data.status,
          });
        })
        .catch((error) => {
          toast.error("Failed to load announcement");
          console.error(error);
        })
        .finally(() => setIsLoading(false));
    }
  }, [open, announcementId, form]);

  const onSubmit = async (data: AnnouncementFormData) => {
    try {
      const payload: any = {
        ...data,
      };

      if (data.body) {
        payload.body = typeof data.body === 'string' ? data.body : JSON.stringify(data.body);
      }

      if (data.scheduledAt) {
        payload.scheduledAt = new Date(data.scheduledAt).toISOString();
      }

      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update announcement");
      }

      toast.success("Announcement updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update announcement");
    }
  };

  const handleClose = () => {
    form.reset();
    setInitialData(null);
    onOpenChange(false);
  };

  const availableTargetRoles = isSuperadmin
    ? ["AllStudents", "AllTeachers", "AllUsers", "SpecificStudents", "SpecificTeachers", "CourseStudents"]
    : ["AllStudents", "SpecificStudents", "CourseStudents"];

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <AnimatePresence>
        {open && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-border/50 bg-gradient-to-br from-background/98 via-background/95 to-background p-0 shadow-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
              className="relative p-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />
              <DialogHeader className="relative space-y-2 text-left">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Edit Announcement
                </DialogTitle>
              </DialogHeader>

              {isLoading ? (
                <div className="py-8 text-center">Loading...</div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="relative mt-6 space-y-6">
                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Announcement Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter announcement title"
                              {...field}
                              className="h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Body */}
                    <FormField
                      control={form.control}
                      name="body"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Announcement Body</FormLabel>
                          <FormControl>
                            <RichTextEditor field={field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Status */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Draft">Draft</SelectItem>
                              <SelectItem value="Scheduled">Scheduled</SelectItem>
                              <SelectItem value="Published">Published</SelectItem>
                              <SelectItem value="Expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Urgent Toggle */}
                    <FormField
                      control={form.control}
                      name="isUrgent"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Mark as Urgent</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Urgent announcements appear at the top
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Schedule Date/Time */}
                    <FormField
                      control={form.control}
                      name="scheduledAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schedule Date & Time (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value ? new Date(value).toISOString() : null);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                      >
                        {form.formState.isSubmitting ? "Updating..." : "Update Announcement"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}











