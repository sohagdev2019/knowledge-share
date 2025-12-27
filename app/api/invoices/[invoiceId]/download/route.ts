import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { invoiceId } = await params;

    // Get invoice and verify it belongs to the user
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        userId: session.user.id,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // If we have a Stripe invoice ID, download from Stripe
    if (invoice.stripeInvoiceId) {
      try {
        const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoiceId);
        
        if (stripeInvoice.invoice_pdf) {
          // Redirect to Stripe's PDF URL
          return NextResponse.redirect(stripeInvoice.invoice_pdf);
        }
      } catch (stripeError) {
        console.error("Error fetching Stripe invoice:", stripeError);
        // Fall through to generate PDF locally
      }
    }

    // Generate PDF locally if Stripe PDF is not available
    // For now, return a JSON response with invoice data
    // You can integrate a PDF generation library like pdfkit or puppeteer here
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      planName: invoice.planName,
      amount: invoice.amount,
      totalAmount: invoice.totalAmount,
      paymentStatus: invoice.paymentStatus,
      paymentDate: invoice.paymentDate,
      createdAt: invoice.createdAt,
    };

    // Return as JSON for now (you can implement PDF generation later)
    return NextResponse.json(invoiceData, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.json"`,
      },
    });
  } catch (error) {
    console.error("Error downloading invoice:", error);
    return NextResponse.json(
      { error: "Failed to download invoice" },
      { status: 500 }
    );
  }
}

