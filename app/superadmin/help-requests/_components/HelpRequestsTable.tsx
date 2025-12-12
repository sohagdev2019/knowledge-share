"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateHelpRequest } from "../../actions";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "@/lib/date-utils";
import { IconCheck, IconClock, IconX, IconMessageCircle } from "@tabler/icons-react";

interface HelpRequest {
  id: string;
  subject: string;
  message: string;
  userType: "Teacher" | "Student" | "Admin";
  status: "Pending" | "InProgress" | "Resolved" | "Closed";
  response: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
    role: string | null;
    image: string | null;
  };
}

interface HelpRequestsTableProps {
  initialRequests: HelpRequest[];
  initialStatus: string;
}

export function HelpRequestsTable({ initialRequests, initialStatus }: HelpRequestsTableProps) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    const params = new URLSearchParams();
    if (newStatus !== "all") {
      params.set("status", newStatus);
    }
    router.push(`/superadmin/help-requests?${params.toString()}`);
  };

  const handleViewRequest = (request: HelpRequest) => {
    setSelectedRequest(request);
    setResponse(request.response || "");
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string, responseText?: string) => {
    setIsSubmitting(true);
    try {
      const result = await updateHelpRequest({
        requestId,
        status: newStatus as any,
        response: responseText || response,
      });

      if (result.status === "success") {
        toast.success(result.message);
        setIsDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><IconClock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "InProgress":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20"><IconMessageCircle className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "Resolved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20"><IconCheck className="h-3 w-3 mr-1" />Resolved</Badge>;
      case "Closed":
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20"><IconX className="h-3 w-3 mr-1" />Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Help Requests</CardTitle>
              <CardDescription>
                {statusFilter === "all" ? "All" : statusFilter} help requests
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="InProgress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No help requests found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={request.user.image || undefined} />
                          <AvatarFallback>
                            {request.user.firstName?.charAt(0) || request.user.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {request.user.firstName} {request.user.lastName || ""}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {request.user.email}
                          </div>
                          <div className="flex gap-1 mt-1">
                            <Badge 
                              variant={request.userType === "Teacher" ? "default" : request.userType === "Admin" ? "destructive" : "secondary"} 
                              className="text-xs"
                            >
                              {request.userType}
                            </Badge>
                            {request.user.role && request.userType !== "Admin" && (
                              <Badge variant="outline" className="text-xs">
                                {request.user.role}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{request.subject}</TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {request.message}
                      </p>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewRequest(request)}
                      >
                        View & Respond
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Help Request Details</DialogTitle>
            <DialogDescription>
              View and respond to the help request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>From</Label>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <Avatar>
                    <AvatarImage src={selectedRequest.user.image || undefined} />
                    <AvatarFallback>
                      {selectedRequest.user.firstName?.charAt(0) || selectedRequest.user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">
                      {selectedRequest.user.firstName} {selectedRequest.user.lastName || ""}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedRequest.user.email}
                    </div>
                    <div className="flex gap-1 mt-1">
                      <Badge 
                        variant={selectedRequest.userType === "Teacher" ? "default" : selectedRequest.userType === "Admin" ? "destructive" : "secondary"} 
                        className="text-xs"
                      >
                        {selectedRequest.userType}
                      </Badge>
                      {selectedRequest.user.role && selectedRequest.userType !== "Admin" && (
                        <Badge variant="outline" className="text-xs">
                          {selectedRequest.user.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <div className="p-2 bg-muted rounded-md">{selectedRequest.subject}</div>
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">
                  {selectedRequest.message}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Response</Label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Enter your response..."
                  className="min-h-[120px]"
                />
              </div>

              {selectedRequest.response && (
                <div className="space-y-2">
                  <Label>Previous Response</Label>
                  <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">
                    {selectedRequest.response}
                  </div>
                  {selectedRequest.respondedAt && (
                    <p className="text-xs text-muted-foreground">
                      Responded {formatDistanceToNow(new Date(selectedRequest.respondedAt), { addSuffix: true })}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={selectedRequest.status}
                  onValueChange={(value) => {
                    setSelectedRequest({ ...selectedRequest, status: value as any });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="InProgress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedRequest) {
                  handleUpdateStatus(selectedRequest.id, selectedRequest.status, response.trim() || undefined);
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


