import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { EarningsCards } from "./_components/EarningsCards";
import { WithdrawalSection } from "./_components/WithdrawalSection";
import { WithdrawalHistoryTable } from "./_components/WithdrawalHistoryTable";

export default async function SuperAdminWithdrawalsPage() {
  await requireSuperAdmin();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Withdrawals</h1>
        <p className="text-muted-foreground">
          Manage and track withdrawal requests from instructors.
        </p>
      </div>

      <EarningsCards />
      <WithdrawalSection />
      <WithdrawalHistoryTable />
    </div>
  );
}
