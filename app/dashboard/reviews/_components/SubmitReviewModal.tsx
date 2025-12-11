"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HalfStarRating } from "./HalfStarRating";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const submitReviewSchema = z.object({
  courseId: z.string().uuid("Please select a course"),
  rating: z.number().min(0.5, "Rating must be at least 0.5").max(5.0, "Rating must be at most 5.0"),
  comment: z.string().optional(),
});

type SubmitReviewFormData = z.infer<typeof submitReviewSchema>;

type CourseData = {
  id: string;
  title: string;
  hasReviewed: boolean;
  reviewId: string | null;
};

type SubmitReviewModalProps = {
  courses: CourseData[];
};

export function SubmitReviewModal({ courses }: SubmitReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [rating, setRating] = useState(0);
  const router = useRouter();

  // Filter out courses that have already been reviewed
  const availableCourses = courses.filter((course) => !course.hasReviewed);

  const form = useForm<SubmitReviewFormData>({
    resolver: zodResolver(submitReviewSchema),
    defaultValues: {
      courseId: "",
      rating: 0,
      comment: "",
    },
  });

  async function onSubmit(values: SubmitReviewFormData) {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        fetch("/api/reviews/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId: values.courseId,
            rating: rating,
            comment: values.comment || undefined,
          }),
        }).then((res) => res.json())
      );

      if (error) {
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }

      if (result.status === "success") {
        toast.success(result.message);
        form.reset();
        setRating(0);
        setIsOpen(false);
        router.refresh();
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      form.reset();
      setRating(0);
    }
    setIsOpen(open);
  }

  if (availableCourses.length === 0) {
    return (
      <Button variant="outline" disabled>
        <Plus className="size-4" />
        Submit Review
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="size-4" />
          Submit Review
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[600px] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit a Review</DialogTitle>
          <DialogDescription>
            Share your experience with a course you've enrolled in.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full min-w-0">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-w-[calc(100vw-4rem)] sm:max-w-[600px]">
                      {availableCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2 flex-wrap">
                  <HalfStarRating
                    rating={rating}
                    onRatingChange={(newRating) => {
                      setRating(newRating);
                      form.setValue("rating", newRating, { shouldValidate: true });
                    }}
                    size={28}
                  />
                  <span className="text-sm text-muted-foreground">
                    Rating: {rating.toFixed(1)}/5.0
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts about this course..."
                      className="min-h-24 w-full resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={pending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={pending || rating === 0}
                className="w-full sm:w-auto"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
