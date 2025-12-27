"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconChartBar, IconUsers, IconEye, IconTrendingUp } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Announcement = {
  id: string;
  title: string;
  viewCount: number;
  targetRole: string;
  publishedAt: string | null;
  _count: {
    readStatuses: number;
  };
  targetCourse: {
    id: string;
    title: string;
  } | null;
};

type AnalyticsData = {
  announcement: {
    id: string;
    title: string;
    targetRole: string;
    publishedAt: string | null;
  };
  metrics: {
    totalViews: number;
    uniqueViews: number;
    targetAudienceSize: number;
    readPercentage: number;
  };
  readers: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string | null;
      email: string;
      image: string | null;
      role: string | null;
    };
    readAt: string;
  }>;
};

type AnnouncementsAnalyticsClientProps = {
  announcements: Announcement[];
};

export function AnnouncementsAnalyticsClient({
  announcements,
}: AnnouncementsAnalyticsClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalytics = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/announcements/${id}/analytics`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedId) {
      fetchAnalytics(selectedId);
    }
  }, [selectedId]);

  const totalViews = announcements.reduce((sum, a) => sum + a.viewCount, 0);
  const totalUniqueViews = announcements.reduce((sum, a) => sum + a._count.readStatuses, 0);
  const publishedCount = announcements.filter((a) => a.publishedAt).length;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Announcement Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track views, engagement, and reach for your announcements
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
            <IconChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">
              {publishedCount} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <IconEye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Across all announcements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Readers</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUniqueViews}</div>
            <p className="text-xs text-muted-foreground">
              Users who read announcements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {announcements.length > 0
                ? Math.round((totalUniqueViews / announcements.length) * 10) / 10
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Readers per announcement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Announcements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Announcement Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Readers</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No announcements found
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">{announcement.title}</TableCell>
                    <TableCell>{formatDate(announcement.publishedAt)}</TableCell>
                    <TableCell>{announcement.viewCount}</TableCell>
                    <TableCell>{announcement._count.readStatuses}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedId(announcement.id)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Analytics Detail Dialog */}
      <Dialog open={selectedId !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Analytics Details</DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : analyticsData ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">{analyticsData.announcement.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Target: {analyticsData.announcement.targetRole}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsData.metrics.totalViews}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Unique Readers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsData.metrics.uniqueViews}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Target Audience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsData.metrics.targetAudienceSize}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Read Percentage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsData.metrics.readPercentage}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {analyticsData.readers.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-4">Readers List</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {analyticsData.readers.map((reader) => (
                      <div
                        key={reader.user.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div>
                          <p className="font-medium">
                            {reader.user.firstName} {reader.user.lastName || ""}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {reader.user.email}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(reader.readAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}











