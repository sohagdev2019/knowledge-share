import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import Link from "next/link";

function formatDate(date: Date | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

export default async function SuperAdminProfilePage() {
  const session = await requireSuperAdmin();
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const firstName = dbUser?.firstName || "";
  const lastName = dbUser?.lastName || "";
  const username = dbUser?.username || session.user.email.split("@")[0];
  const phoneNumber = dbUser?.phoneNumber || "Not provided";
  const designation = dbUser?.designation || "Not specified";
  const bio = dbUser?.bio?.trim();

  const registrationDate = formatDate(dbUser?.createdAt);

  const profileFields = [
    { label: "First Name", value: firstName || "—" },
    { label: "Last Name", value: lastName || "—" },
    { label: "Registration Date", value: registrationDate },
    { label: "User Name", value: username || "—" },
    { label: "Phone Number", value: phoneNumber },
    { label: "Designation", value: designation },
    { label: "Email", value: session.user.email },
    { label: "Role", value: dbUser?.role || "—" },
    { label: "Gender", value: "Not specified" },
    { label: "DOB", value: "Not provided" },
    { label: "Age", value: "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Review your basic account information and keep it up to date.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full md:w-auto">
          <Link href="/superadmin/settings">
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                These details help instructors and admins understand who you are.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {profileFields.map((field) => (
              <ProfileField key={field.label} label={field.label} value={field.value} />
            ))}
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase">
              Bio
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {bio && bio.length > 0
                ? bio
                : "Add a short bio to let others know more about your background and expertise."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
        {label}
      </p>
      <p className="text-base font-medium text-foreground">{value}</p>
    </div>
  );
}
