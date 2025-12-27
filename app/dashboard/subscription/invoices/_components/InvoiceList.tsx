"use client";

import { UserInvoiceType } from "@/app/data/subscription/get-user-invoices";
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
import { Download } from "lucide-react";

interface InvoiceListProps {
  invoices: UserInvoiceType[];
}

function getPaymentStatusBadgeVariant(status: string) {
  switch (status) {
    case "Paid":
      return "default";
    case "Pending":
      return "secondary";
    case "Failed":
      return "destructive";
    case "Refunded":
      return "outline";
    default:
      return "outline";
  }
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No invoices found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">#{invoice.invoiceNumber}</TableCell>
              <TableCell>
                {new Date(invoice.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>{invoice.planName}</TableCell>
              <TableCell>${(invoice.totalAmount / 100).toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={getPaymentStatusBadgeVariant(invoice.paymentStatus)}>
                  {invoice.paymentStatus}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    window.open(`/api/invoices/user/${invoice.id}/download`, '_blank');
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

