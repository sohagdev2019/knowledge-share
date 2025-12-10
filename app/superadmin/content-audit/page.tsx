"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";

interface ContentAudit {
  unpublishedCourses: any[];
  incompleteCourses: any[];
  coursesMissingThumbnails: any[];
  lessonsWithoutVideos: any[];
}

export default function ContentAuditPage() {
  const [audit, setAudit] = useState<ContentAudit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/courses/content-audit");
      const data = await res.json();
      
      if (res.ok && !data.error) {
        setAudit(data);
      } else {
        const errorMessage = data.error || "Unknown error";
        console.error("Failed to fetch data:", errorMessage, data);
        
        // Show user-friendly error message
        if (res.status === 403) {
          console.error("Access denied. Super admin privileges required.");
        } else if (res.status === 401) {
          console.error("Authentication required. Please log in.");
        } else {
          console.error("Server error:", errorMessage);
        }
        
        setAudit(null);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setAudit(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Audit</h1>
        <p className="text-muted-foreground">
          Identify incomplete courses, missing content, and content quality issues
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !audit ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Failed to load content audit</h3>
                <p className="text-sm text-muted-foreground">
                  Please check your console for details or try refreshing the page.
                </p>
                <p className="text-xs text-muted-foreground">
                  Make sure you have super admin privileges to access this page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="unpublished">
          <TabsList>
            <TabsTrigger value="unpublished">
              Unpublished ({audit?.unpublishedCourses?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="incomplete">
              Incomplete ({audit?.incompleteCourses?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="thumbnails">
              Missing Thumbnails ({audit?.coursesMissingThumbnails?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="videos">
              Missing Videos ({audit?.lessonsWithoutVideos?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unpublished" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Unpublished Courses</CardTitle>
                <CardDescription>
                  Courses that are still in draft status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audit?.unpublishedCourses?.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">
                          {course.title}
                        </TableCell>
                        <TableCell>
                          {course.user.firstName} {course.user.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{course.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(course.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No unpublished courses found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incomplete" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Incomplete Courses</CardTitle>
                <CardDescription>
                  Courses missing chapters or lessons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Chapters</TableHead>
                      <TableHead>Lessons</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audit?.incompleteCourses?.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">
                          {course.title}
                        </TableCell>
                        <TableCell>
                          {course.user.firstName} {course.user.lastName}
                        </TableCell>
                        <TableCell>{course.chaptersCount}</TableCell>
                        <TableCell>{course.lessonsCount}</TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No incomplete courses found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="thumbnails" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Courses Missing Thumbnails</CardTitle>
                <CardDescription>
                  Courses without thumbnail images
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Teacher</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audit?.coursesMissingThumbnails?.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">
                          {course.title}
                        </TableCell>
                        <TableCell>
                          {course.user.firstName} {course.user.lastName}
                        </TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          No courses missing thumbnails found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lessons Without Videos</CardTitle>
                <CardDescription>
                  Lessons missing video content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lesson</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Teacher</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audit?.lessonsWithoutVideos?.map((lesson) => (
                      <TableRow key={lesson.lessonId}>
                        <TableCell className="font-medium">
                          {lesson.lessonTitle}
                        </TableCell>
                        <TableCell>{lesson.courseTitle}</TableCell>
                        <TableCell>{lesson.teacher}</TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No lessons without videos found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
