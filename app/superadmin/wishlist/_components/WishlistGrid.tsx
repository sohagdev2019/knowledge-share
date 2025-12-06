"use client";

import { motion } from "framer-motion";
import Image, { StaticImageData } from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconHeart } from "@tabler/icons-react";

type WishlistItem = {
  id: string;
  title: string;
  instructor: string;
  category: string;
  rating: number;
  reviews: number;
  price: string;
  image: StaticImageData | string;
};

type WishlistGridProps = {
  items: readonly WishlistItem[];
};

export function WishlistGrid({ items }: WishlistGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <motion.article
          key={item.id}
          className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-background/90 via-background to-background shadow-lg shadow-black/5 transition hover:-translate-y-1 hover:shadow-emerald-500/10"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06, duration: 0.4 }}
        >
          <div className="relative h-48 overflow-hidden">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={index < 2}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
            <motion.button
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-destructive shadow-lg backdrop-blur"
              whileTap={{ scale: 0.9 }}
            >
              <IconHeart className="size-4" />
            </motion.button>
          </div>

          <div className="flex flex-1 flex-col space-y-4 px-5 pb-5 pt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 font-medium">
                  {item.instructor}
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold uppercase tracking-wide text-primary">
                {item.category}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-semibold leading-tight text-foreground group-hover:text-primary">
                {item.title}
              </h3>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1 font-medium">
                <span className="text-amber-400">★</span>
                <span>{item.rating.toFixed(1)}</span>
                <span className="text-xs">
                  ({item.reviews} Review{item.reviews !== 1 && "s"})
                </span>
              </div>
              <span
                className={cn(
                  "text-lg font-semibold",
                  item.price.toLowerCase() === "free" ? "text-emerald-500" : "text-foreground"
                )}
              >
                {item.price}
              </span>
            </div>

            <motion.div
              className="flex flex-wrap items-center justify-between gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 + 0.2 }}
            >
              <Button className="rounded-full px-5 py-2 text-xs font-semibold shadow-primary/20">
                View Course
              </Button>
              <span className="text-xs text-muted-foreground">Updated recently</span>
            </motion.div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

