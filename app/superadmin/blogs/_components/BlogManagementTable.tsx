"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Edit, Trash2, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "@/lib/date-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface Blog {
  id: string;
  title: string;
  slug: string;
  status: string;
  isFeatured: boolean;
  isDraft: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  author: {
    firstName: string;
    lastName: string | null;
  };
  category: {
    name: string;
  } | null;
}

interface BlogManagementTableProps {
  blogs: Blog[];
  total: number;
  currentPage: number;
  status: string;
  userRole: string | null;
}

export function BlogManagementTable({
  blogs,
  total,
  currentPage,
  status,
  userRole,
}: BlogManagementTableProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);

  const handleStatusChange = (newStatus: string) => {
    router.push(`/superadmin/blogs?status=${newStatus}`);
  };

  const handleAction = async (blogId: string, action: string, data?: any) => {
    setProcessing(blogId);
    try {
      const response = await fetch(`/api/admin/blogs/${blogId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Action completed successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to perform action");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div className="flex items-center gap-4">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Published">Published</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          Total: {total} blogs
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Author</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Stats</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.id} className="border-t hover:bg-muted/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    {blog.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm">
                  {blog.author.firstName} {blog.author.lastName}
                </td>
                <td className="px-4 py-3 text-sm">
                  {blog.category ? (
                    <Badge variant="outline">{blog.category.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      blog.status === "Approved"
                        ? "default"
                        : blog.status === "Rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {blog.status}
                  </Badge>
                  {blog.isFeatured && (
                    <Star className="w-4 h-4 text-primary ml-2 inline" />
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  <div className="flex flex-col gap-1">
                    <span>👁️ {blog.viewCount}</span>
                    <span>❤️ {blog.likeCount}</span>
                    <span>💬 {blog.commentCount}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/blogs/${blog.slug}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    {blog.status === "Pending" && userRole === "superadmin" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAction(blog.id, "approve")}
                          disabled={processing === blog.id}
                        >
                          <Check className="w-4 h-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const reason = prompt("Rejection reason:");
                            if (reason) {
                              handleAction(blog.id, "reject", { reason });
                            }
                          }}
                          disabled={processing === blog.id}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(blog.id, "feature")}
                      disabled={processing === blog.id}
                    >
                      <Star className={`w-4 h-4 ${blog.isFeatured ? "fill-primary text-primary" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this blog?")) {
                          handleAction(blog.id, "delete");
                        }
                      }}
                      disabled={processing === blog.id}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {blogs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No blogs found with status: {status}
        </div>
      )}
    </div>
  );
}
