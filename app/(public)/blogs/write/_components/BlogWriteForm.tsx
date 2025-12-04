"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blogSchema, BlogSchemaType } from "@/lib/zodSchemas";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Uploader } from "@/components/file-uploader/Uploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransition, useEffect } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Save, Sparkles } from "lucide-react";
import { useState } from "react";
import { createBlog } from "../actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BlogWriteFormProps {
  categories: Array<{ id: string; name: string; slug: string }>;
  userPoints: number;
  remainingFreePosts: number;
}

export function BlogWriteForm({ categories, userPoints, remainingFreePosts }: BlogWriteFormProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("professional");
  const [aiLength, setAiLength] = useState("medium");

  const form = useForm<BlogSchemaType>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      coverImageKey: "",
      seoTitle: "",
      seoDescription: "",
      categoryId: undefined,
      tags: [],
      isDraft: false,
      courseId: "",
    },
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      form.setValue("tags", newTags);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    form.setValue("tags", newTags);
  };

  const onSubmit = (values: BlogSchemaType) => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(createBlog(values));

      if (error) {
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }

      if (result?.status === "success") {
        toast.success(result.message);
        router.push(`/blogs/${result.slug}`);
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  };

  const handleSaveDraft = () => {
    form.setValue("isDraft", true);
    form.handleSubmit(onSubmit)();
  };

  // Auto-generate SEO fields from title
  const title = form.watch("title");
  const excerpt = form.watch("excerpt");
  const seoTitle = form.watch("seoTitle");

  useEffect(() => {
    if (title && !seoTitle) {
      form.setValue("seoTitle", title.substring(0, 60));
      form.setValue("seoDescription", excerpt?.substring(0, 160) || "");
    }
  }, [title, excerpt, seoTitle, form]);

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) {
      toast.error("Please enter a topic for the blog");
      return;
    }

    setAiGenerating(true);
    try {
      const selectedCategory = form.getValues("categoryId");
      const categoryName = selectedCategory
        ? categories.find((c) => c.id === selectedCategory)?.name
        : undefined;

      const response = await fetch("/api/blogs/generate-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: aiTopic,
          tone: aiTone,
          length: aiLength,
          category: categoryName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to generate blog content");
        return;
      }

      if (data.success && data.data) {
        // Populate form with generated content
        form.setValue("title", data.data.title);
        form.setValue("excerpt", data.data.excerpt);
        form.setValue("content", data.data.content);
        form.setValue("seoTitle", data.data.seoTitle);
        form.setValue("seoDescription", data.data.seoDescription);
        
        // Set tags
        if (data.data.tags && data.data.tags.length > 0) {
          setTags(data.data.tags);
          form.setValue("tags", data.data.tags);
        }

        toast.success("Blog content generated successfully! Review and edit as needed.");
        setAiDialogOpen(false);
        setAiTopic("");
      } else {
        toast.error("Failed to generate blog content");
      }
    } catch (error: any) {
      console.error("Error generating blog:", error);
      toast.error("An error occurred while generating the blog");
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* AI Generation Button */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-primary/10">
          <div>
            <h3 className="font-semibold text-sm mb-1">AI Blog Generator</h3>
            <p className="text-xs text-muted-foreground">
              Let AI help you create a complete blog post
            </p>
          </div>
          <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Generate Blog with AI</DialogTitle>
                <DialogDescription>
                  Enter a topic and preferences to generate a complete blog post
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-topic">Blog Topic *</Label>
                  <Input
                    id="ai-topic"
                    placeholder="e.g., Introduction to React Hooks"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    disabled={aiGenerating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-tone">Tone</Label>
                  <Select
                    value={aiTone}
                    onValueChange={setAiTone}
                    disabled={aiGenerating}
                  >
                    <SelectTrigger id="ai-tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-length">Length</Label>
                  <Select
                    value={aiLength}
                    onValueChange={setAiLength}
                    disabled={aiGenerating}
                  >
                    <SelectTrigger id="ai-length">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (500-800 words)</SelectItem>
                      <SelectItem value="medium">Medium (800-1200 words)</SelectItem>
                      <SelectItem value="long">Long (1200+ words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAiDialogOpen(false)}
                  disabled={aiGenerating}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={aiGenerating || !aiTopic.trim()}
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* Cover Image */}
        <FormField
          control={form.control}
          name="coverImageKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image (Optional)</FormLabel>
              <FormControl>
                <Uploader
                  value={field.value}
                  onChange={field.onChange}
                  endpoint="upload"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="Enter blog title..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Excerpt */}
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt (Short Description)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write a brief description of your blog..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value === "none" ? undefined : value)} 
                value={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-primary/80"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </FormItem>

        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content *</FormLabel>
              <FormControl>
                <RichTextEditor field={field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SEO Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="seoTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Title (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="SEO title..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="seoDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="SEO description..." rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {remainingFreePosts > 0 ? (
              <>You have <strong>{remainingFreePosts}</strong> free post{remainingFreePosts !== 1 ? 's' : ''} remaining. This post will be free.</>
            ) : (
              <>Publishing will cost 5 points. You have {userPoints} points.</>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={pending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Blog"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}


