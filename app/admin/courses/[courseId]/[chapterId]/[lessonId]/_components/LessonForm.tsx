"use client";

import { AdminLessonType } from "@/app/data/admin/admin-get-lesson";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { lessonSchema, LessonSchemaType, lessonStatus } from "@/lib/zodSchemas";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Uploader } from "@/components/file-uploader/Uploader";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { FileText, ChevronDown, HelpCircle, Plus, Trash2 } from "lucide-react";
import { useTransition, useState } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { updateLesson } from "../actions";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface iAppProps {
  data: AdminLessonType;
  chapterId: string;
  courseId: string;
}

export function LessonForm({ chapterId, data, courseId }: iAppProps) {
  const [pending, startTransition] = useTransition();
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(!!data.assignment);
  const [isQuizOpen, setIsQuizOpen] = useState(!!data.quiz);
  const form = useForm<LessonSchemaType>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      name: data.title,
      chapterId: chapterId,
      courseId: courseId,
      description: data.description ?? undefined,
      videoKey: data.videoKey ?? undefined,
      thumbnailKey: data.thumbnailKey ?? undefined,
       status: data.status ?? "Draft",
       releaseAt: data.releaseAt
         ? new Date(data.releaseAt).toISOString().slice(0, 16)
         : "",
      assignment: data.assignment
        ? {
            title: data.assignment.title ?? "",
            description: data.assignment.description ?? "",
            fileKey: data.assignment.fileKey ?? "",
            points: data.assignment.points ?? undefined,
            dueDate: data.assignment.dueDate
              ? new Date(data.assignment.dueDate).toISOString().split("T")[0]
              : "",
          }
        : {
            title: "",
            description: "",
            fileKey: "",
            points: undefined,
            dueDate: "",
          },
      quiz: data.quiz
        ? {
            title: data.quiz.title ?? "",
            points: data.quiz.points ?? 10,
            required: data.quiz.required ?? true,
            questions: data.quiz.questions.map((q) => ({
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
            })),
          }
        : {
            title: "",
            points: 10,
            required: true,
            questions: [],
          },
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: LessonSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        updateLesson(values, data.id)
      );

      if (error) {
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }

      if (result.status === "success") {
        toast.success(result.message);
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }
  return (
    <div>
      <Link
        className={buttonVariants({ variant: "outline", className: "mb-6" })}
        href={`/admin/courses/${courseId}/edit`}
      >
        <ArrowLeft className="size-4" />

        <span>Go Back</span>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Configuration</CardTitle>
          <CardDescription>
            Configure the video and description for this lesson.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Chapter xyz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichTextEditor field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {lessonStatus.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="releaseAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule Time (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="thumbnailKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail image</FormLabel>
                    <FormControl>
                      <Uploader
                        fileTypeAccepted="image"
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="videoKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video File</FormLabel>
                    <FormControl>
                      <Uploader
                        onChange={field.onChange}
                        value={field.value}
                        fileTypeAccepted="video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="my-6" />

              <Collapsible
                open={isAssignmentOpen}
                onOpenChange={setIsAssignmentOpen}
                className="space-y-4"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="size-4" />
                      <span>Assignment</span>
                    </div>
                    <ChevronDown
                      className={`size-4 transition-transform ${
                        isAssignmentOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="assignment.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignment Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Complete the Python exercise"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assignment.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignment Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide instructions for the assignment..."
                            rows={4}
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="assignment.points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Points</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="100"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assignment.dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" value={field.value ?? ""} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="assignment.fileKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignment File (Optional)</FormLabel>
                        <FormControl>
                          <Uploader
                            fileTypeAccepted="document"
                            onChange={field.onChange}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>

              <Separator className="my-6" />

              <Collapsible
                open={isQuizOpen}
                onOpenChange={setIsQuizOpen}
                className="space-y-4"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle className="size-4" />
                      <span>Quiz</span>
                    </div>
                    <ChevronDown
                      className={`size-4 transition-transform ${
                        isQuizOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quiz.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quiz Title (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Lesson 1 Quiz"
                              value={field.value ?? ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quiz.points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Points Awarded</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="10"
                              value={field.value ?? 10}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : 10
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="quiz.required"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Required to Proceed</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Students must complete this quiz before accessing next lesson
                          </p>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value ?? true}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quiz.questions"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-2">
                          <FormLabel>Questions</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentQuestions = field.value || [];
                              field.onChange([
                                ...currentQuestions,
                                {
                                  question: "",
                                  options: ["", "", "", ""],
                                  correctAnswer: 0,
                                },
                              ]);
                            }}
                          >
                            <Plus className="size-4 mr-2" />
                            Add Question
                          </Button>
                        </div>
                        <FormControl>
                          <div className="space-y-4">
                            {(field.value || []).map((question, qIndex) => (
                              <Card key={qIndex} className="p-4">
                                <div className="flex items-start justify-between mb-4">
                                  <h4 className="font-medium">
                                    Question {qIndex + 1}
                                  </h4>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const currentQuestions = field.value || [];
                                      field.onChange(
                                        currentQuestions.filter((_, i) => i !== qIndex)
                                      );
                                    }}
                                  >
                                    <Trash2 className="size-4 text-destructive" />
                                  </Button>
                                </div>

                                <div className="space-y-4">
                                  <Input
                                    placeholder="Enter your question..."
                                    value={question.question}
                                    onChange={(e) => {
                                      const currentQuestions = field.value || [];
                                      const updated = [...currentQuestions];
                                      updated[qIndex] = {
                                        ...updated[qIndex],
                                        question: e.target.value,
                                      };
                                      field.onChange(updated);
                                    }}
                                  />

                                  <div className="space-y-2">
                                    <p className="text-sm font-medium">Options:</p>
                                    {question.options.map((option, oIndex) => (
                                      <div key={oIndex} className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          name={`question-${qIndex}`}
                                          checked={question.correctAnswer === oIndex}
                                          onChange={() => {
                                            const currentQuestions = field.value || [];
                                            const updated = [...currentQuestions];
                                            updated[qIndex] = {
                                              ...updated[qIndex],
                                              correctAnswer: oIndex,
                                            };
                                            field.onChange(updated);
                                          }}
                                          className="h-4 w-4"
                                        />
                                        <Input
                                          placeholder={`Option ${oIndex + 1}`}
                                          value={option}
                                          onChange={(e) => {
                                            const currentQuestions = field.value || [];
                                            const updated = [...currentQuestions];
                                            updated[qIndex].options[oIndex] = e.target.value;
                                            field.onChange(updated);
                                          }}
                                        />
                                        {question.options.length > 2 && (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const currentQuestions = field.value || [];
                                              const updated = [...currentQuestions];
                                              updated[qIndex].options = updated[qIndex].options.filter(
                                                (_, i) => i !== oIndex
                                              );
                                              if (updated[qIndex].correctAnswer >= updated[qIndex].options.length) {
                                                updated[qIndex].correctAnswer = 0;
                                              }
                                              field.onChange(updated);
                                            }}
                                          >
                                            <Trash2 className="size-3" />
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                    {question.options.length < 10 && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const currentQuestions = field.value || [];
                                          const updated = [...currentQuestions];
                                          updated[qIndex].options = [
                                            ...updated[qIndex].options,
                                            "",
                                          ];
                                          field.onChange(updated);
                                        }}
                                      >
                                        <Plus className="size-3 mr-2" />
                                        Add Option
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>

              <Button disabled={pending} type="submit">
                {pending ? "Saving.." : "Save Lesson"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
