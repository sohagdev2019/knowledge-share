"use client";

import { useEffect, useState } from "react";
import { StudentsGridSection } from "./StudentsGridSection";
import { StudentsSkeleton } from "./StudentsSkeleton";
import { StudentType } from "@/app/data/student/get-all-students";

export function StudentsPageClient() {
  const [students, setStudents] = useState<StudentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        const response = await fetch("/api/students");
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.details || errorData.error || "Failed to fetch students";
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        setStudents(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching students:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load students. Please try again later.";
        setError(errorMessage);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, []);

  if (loading) {
    return <StudentsSkeleton />;
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
                  <li>Check that your <code className="bg-background px-1 rounded">DATABASE_URL</code> is set correctly in <code className="bg-background px-1 rounded">.env.local</code></li>
                  <li>If using Neon, ensure your database is not paused (free tier databases auto-pause after inactivity)</li>
                  <li>Verify your database connection string includes <code className="bg-background px-1 rounded">?sslmode=require</code></li>
                  <li>Restart your development server after updating environment variables</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return <StudentsGridSection students={students} />;
}
