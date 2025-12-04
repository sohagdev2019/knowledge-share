import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function BlogHero() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 border-b border-border">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">
              Knowledge Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Share your knowledge, learn from others, and grow together. Discover insights, tutorials, and stories from our community.
            </p>
          </div>
          {session && (
            <Link
              href="/blogs/write"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Write a Blog
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}


