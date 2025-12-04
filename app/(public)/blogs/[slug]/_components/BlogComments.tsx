"use client";

import { useState } from "react";
import { MessageCircle, Send, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatDistanceToNow } from "@/lib/date-utils";
import Image from "next/image";
import { useConstructUrl } from "@/hooks/use-construct-url";

interface Comment {
  id: string;
  content: string;
  upvotes: number;
  createdAt: Date;
  author: {
    id: string;
    firstName: string;
    lastName: string | null;
    image: string | null;
    username: string | null;
  };
  replies: Comment[];
}

interface BlogCommentsProps {
  blogId: string;
  initialComments: Comment[];
}

export function BlogComments({ blogId, initialComments }: BlogCommentsProps) {
  const { data: session } = authClient.useSession();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const constructFileUrl = useConstructUrl();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please login to comment");
      return;
    }

    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const response = await fetch(`/api/blogs/${blogId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment, parentId: null }),
      });

      const data = await response.json();

      if (response.ok) {
        setComments([data.comment, ...comments]);
        setComment("");
        toast.success("Comment added!");
      } else {
        toast.error(data.error || "Failed to add comment");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleReply = async (parentId: string) => {
    if (!session) {
      toast.error("Please login to reply");
      return;
    }

    if (!replyContent.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    try {
      const response = await fetch(`/api/blogs/${blogId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent, parentId }),
      });

      const data = await response.json();

      if (response.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: [...c.replies, data.comment] }
              : c
          )
        );
        setReplyContent("");
        setReplyingTo(null);
        toast.success("Reply added!");
      } else {
        toast.error(data.error || "Failed to add reply");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="mt-8 bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5" />
        <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>
      </div>

      {/* Comment Form */}
      {session ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            rows={4}
            className="mb-3"
          />
          <Button type="submit">
            <Send className="w-4 h-4 mr-2" />
            Post Comment
          </Button>
        </form>
      ) : (
        <p className="text-muted-foreground mb-6">Please login to comment</p>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-border pb-6 last:border-0">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {comment.author.image ? (
                  <Image
                    src={
                      comment.author.image.startsWith("http")
                        ? comment.author.image
                        : constructFileUrl(comment.author.image)
                    }
                    alt={comment.author.firstName}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">
                    {comment.author.firstName} {comment.author.lastName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-foreground mb-3">{comment.content}</p>
                {session && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  >
                    Reply
                  </Button>
                )}
                {replyingTo === comment.id && (
                  <div className="mt-3">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      rows={2}
                      className="mb-2"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleReply(comment.id)}>
                        Post Reply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                {comment.replies.length > 0 && (
                  <div className="mt-4 ml-6 space-y-4 border-l-2 border-border pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {reply.author.firstName} {reply.author.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}


