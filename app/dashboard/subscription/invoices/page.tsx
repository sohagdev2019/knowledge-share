import { getUserInvoices } from "@/app/data/subscription/get-user-invoices";
import { InvoiceList } from "./_components/InvoiceList";
import { requireUser } from "@/app/data/user/require-user";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  await requireUser();
  const invoices = await getUserInvoices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invoices</h1>
        <p className="text-muted-foreground">View and download your invoices</p>
      </div>
      <InvoiceList invoices={invoices} />
    </div>
  );
}

