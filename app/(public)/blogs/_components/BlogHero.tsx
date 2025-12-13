import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";

export async function BlogHero() {
  const session = await auth();

  return (
    <div className="relative border-b border-border overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-20 md:pt-24 lg:pt-28 pb-8 md:pb-10 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              Knowledge Blog
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
              Share your knowledge, learn from others, and grow together. Discover insights, tutorials, and stories from our community.
            </p>
          </div>
          {session && (
            <Link
              href="/blogs/write"
              className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground rounded-xl font-semibold overflow-hidden transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-primary/50 hover:scale-105 active:scale-95 hover:brightness-110"
            >
              {/* Animated background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              {/* Shimmer effect that sweeps across on hover */}
              <div 
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/25 to-transparent"
                style={{
                  transform: 'translateX(-100%)',
                }}
              />
              
              {/* Outer glow effect */}
              <div className="absolute -inset-0.5 rounded-xl bg-primary/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 group-hover:animate-pulse" />
              
              {/* Inner shine */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Content with z-index to stay on top */}
              <span className="relative z-10 flex items-center gap-2">
                <Plus 
                  className="w-5 h-5 transition-all duration-500 group-hover:rotate-90 group-hover:scale-110" 
                  style={{ transformOrigin: 'center' }}
                />
                <span className="relative inline-block">
                  Write a Blog
                  {/* Animated underline */}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary-foreground/90 group-hover:w-full transition-all duration-500 ease-out" />
                </span>
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}



