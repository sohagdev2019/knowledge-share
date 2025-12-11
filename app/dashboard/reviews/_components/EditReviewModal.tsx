"use client";

import { useState, useTransition, useEffect } from "react";
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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HalfStarRating } from "./HalfStarRating";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const editReviewSchema = z.object({
  rating: z.number().min(0.5, "Rating must be at least 0.5").max(5.0, "Rating must be at most 5.0"),
  comment: z.string().optional(),
});

type EditReviewFormData = z.infer<typeof editReviewSchema>;

type Review = {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  timeAgo: string;
  rating: number;
  content: string;
  createdAt: string;
  courseId: string;
  courseTitle: string;
};

type EditReviewModalProps = {
  review: Review;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditReviewModal({ review, open, onOpenChange }: EditReviewModalProps) {
  const [pending, startTransition] = useTransition();
  const [rating, setRating] = useState(review.rating);
  const router = useRouter();

  const form = useForm<EditReviewFormData>({
    resolver: zodResolver(editReviewSchema),
    defaultValues: {
      rating: review.rating,
      comment: review.content || "",
    },
  });

  useEffect(() => {
    if (open) {
      setRating(review.rating);
      form.reset({
        rating: review.rating,
        comment: review.content || "",
      });
    }
  }, [open, review, form]);

  async function onSubmit(values: EditReviewFormData) {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        fetch(`/api/reviews/${review.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
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
        onOpenChange(false);
        router.refresh();
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      form.reset();
      setRating(review.rating);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[600px] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
          <DialogDescription>
            Update your review for {review.courseTitle}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    Updating...
                  </>
                ) : (
                  "Update Review"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
