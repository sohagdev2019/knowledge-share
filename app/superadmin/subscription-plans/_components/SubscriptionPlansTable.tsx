"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { AdminSubscriptionPlanType } from "@/app/data/admin/get-all-subscription-plans";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteSubscriptionPlan } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SubscriptionPlansTableProps {
  plans: AdminSubscriptionPlanType[];
}

export function SubscriptionPlansTable({ plans }: SubscriptionPlansTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const result = await deleteSubscriptionPlan(id);
      if (result.status === "success") {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to delete plan");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  if (plans.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground mb-4">No subscription plans found</p>
        <Link href="/superadmin/subscription-plans/create">
          <Button>Create Your First Plan</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Price (Monthly)</TableHead>
            <TableHead>Price (Yearly)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Features</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {plan.name}
                  {plan.isPopular && (
                    <Badge variant="default" className="text-xs">
                      Popular
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {plan.slug}
                </code>
              </TableCell>
              <TableCell>${(plan.priceMonthly / 100).toFixed(2)}</TableCell>
              <TableCell>${(plan.priceYearly / 100).toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={plan.isActive ? "default" : "secondary"}>
                  {plan.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {plan.maxCourseAccess === null && (
                    <Badge variant="outline" className="text-xs">
                      Unlimited
                    </Badge>
                  )}
                  {plan.allowsDownloads && (
                    <Badge variant="outline" className="text-xs">
                      Downloads
                    </Badge>
                  )}
                  {plan.allowsCertificates && (
                    <Badge variant="outline" className="text-xs">
                      Certificates
                    </Badge>
                  )}
                  {plan.allowsTeamAccess && (
                    <Badge variant="outline" className="text-xs">
                      Team
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/superadmin/subscription-plans/${plan.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === plan.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the "{plan.name}" subscription plan.
                          This action cannot be undone. Make sure there are no active
                          subscriptions using this plan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(plan.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

