"use client";

import { useEffect, useState, useMemo } from "react";
import { InstructorsGridSection } from "./InstructorsGridSection";
import { InstructorsSkeleton } from "./InstructorsSkeleton";
import { InstructorType } from "@/app/data/instructor/get-all-instructors";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export function InstructorsPageClient() {
  const [instructors, setInstructors] = useState<InstructorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchInstructors() {
      try {
        setLoading(true);
        const response = await fetch("/api/instructors");

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.details ||
            errorData.error ||
            "Failed to fetch instructors";
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setInstructors(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching instructors:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load instructors. Please try again later.";
        setError(errorMessage);
        setInstructors([]);
      } finally {
        setLoading(false);
      }
    }

    fetchInstructors();
  }, []);

  // Filter instructors based on search query
  const filteredInstructors = useMemo(() => {
    if (!searchQuery.trim()) {
      return instructors;
    }

    const query = searchQuery.toLowerCase();
    return instructors.filter(
      (instructor) =>
        instructor.firstName.toLowerCase().includes(query) ||
        instructor.lastName?.toLowerCase().includes(query) ||
        instructor.email.toLowerCase().includes(query) ||
        instructor.designation?.toLowerCase().includes(query) ||
        instructor.bio?.toLowerCase().includes(query)
    );
  }, [instructors, searchQuery]);

  if (loading) {
    return <InstructorsSkeleton />;
  }

  if (error) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center py-12 space-y-4">
            <p className="text-destructive text-lg font-semibold">{error}</p>
            {error.includes("Database connection") && (
              <div className="mt-4 p-4 bg-muted rounded-lg text-sm text-left max-w-2xl mx-auto">
                <p className="font-medium mb-2">Troubleshooting steps:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>
                    Check that your{" "}
                    <code className="bg-background px-1 rounded">
                      DATABASE_URL
                    </code>{" "}
                    is set correctly in{" "}
                    <code className="bg-background px-1 rounded">
                      .env.local
                    </code>
                  </li>
                  <li>
                    If using Neon, ensure your database is not paused (free tier
                    databases auto-pause after inactivity)
                  </li>
                  <li>
                    Verify your database connection string includes{" "}
                    <code className="bg-background px-1 rounded">
                      ?sslmode=require
                    </code>
                  </li>
                  <li>
                    Restart your development server after updating environment
                    variables
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6 pt-8 md:pt-12">
      {/* Search Bar */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search instructors by name, email, or designation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-3 text-sm text-muted-foreground text-center">
              {filteredInstructors.length} instructor
              {filteredInstructors.length !== 1 ? "s" : ""} found
            </div>
          )}
        </div>
      </div>

      <InstructorsGridSection instructors={filteredInstructors} />
    </div>
  );
}
