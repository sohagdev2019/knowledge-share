"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconSearch, IconFilter } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type SearchResult = {
  id: string;
  type: string;
  title: string;
  description: string;
  matches: string[];
};

type SearchPageClientProps = {
  demoResults: readonly SearchResult[];
};

export function SearchPageClient({ demoResults }: SearchPageClientProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(demoResults);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(demoResults);
      return;
    }
    const lower = trimmed.toLowerCase();
    setResults(
      demoResults.filter(
        (result) =>
          result.title.toLowerCase().includes(lower) ||
          result.description.toLowerCase().includes(lower) ||
          result.matches.some((match) => match.toLowerCase().includes(lower))
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Global Search
        </h1>
        <p className="text-sm text-muted-foreground">
          Find courses, students, orders, and resources from one place.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-gradient-to-br from-background/98 via-background/95 to-background p-4 shadow-lg shadow-black/5 sm:flex-row"
        >
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for courses, students, orders..."
              className="h-12 pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 sm:w-auto"
            >
              <IconFilter className="h-4 w-4" />
              Filters
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Search
            </Button>
          </div>
        </motion.div>
      </form>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, type: "spring" }}
        className="space-y-4"
      >
        {results.length === 0 ? (
          <Card className="border-border/60 bg-background/70">
            <CardContent className="p-8 text-center text-muted-foreground">
              No results. Try a different keyword.
            </CardContent>
          </Card>
        ) : (
          results.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card className="group relative overflow-hidden border-border/60 bg-gradient-to-br from-background/98 via-background/95 to-background shadow-lg shadow-black/5 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardHeader className="relative flex flex-row items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{result.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{result.description}</p>
                  </div>
                  <Badge variant="outline" className="rounded-full border-0 bg-primary/10 text-primary">
                    {result.type}
                  </Badge>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex flex-wrap gap-2">
                    {result.matches.map((match) => (
                      <Badge
                        key={match}
                        variant="outline"
                        className={cn(
                          "rounded-full border-0 bg-muted/60 text-muted-foreground",
                          match.toLowerCase().includes("status")
                            ? "bg-emerald-500/20 text-emerald-600"
                            : match.toLowerCase().includes("date")
                              ? "bg-blue-500/20 text-blue-600"
                              : ""
                        )}
                      >
                        {match}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}

