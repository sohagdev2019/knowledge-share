"use server";

import { getHelpRequests } from "@/app/data/admin/get-help-requests";
import { HelpRequestsTable } from "./_components/HelpRequestsTable";

export default async function HelpRequestsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status || "all";
  const helpRequests = await getHelpRequests(status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Help Requests</h1>
        <p className="text-muted-foreground">
          Manage and respond to help requests from users and admins
        </p>
      </div>

      <HelpRequestsTable initialRequests={helpRequests} initialStatus={status} />
    </div>
  );
}


