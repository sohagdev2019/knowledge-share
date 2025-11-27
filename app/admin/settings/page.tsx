import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ProfileForm } from "@/app/dashboard/settings/_components/ProfileForm";
import { PasswordForm } from "@/app/dashboard/settings/_components/PasswordForm";
import { SocialLinksForm } from "@/app/dashboard/settings/_components/SocialLinksForm";
import { BillingAddressForm } from "@/app/dashboard/settings/_components/BillingAddressForm";

export default async function AdminSettingsPage() {
  const session = await requireAdmin();
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      billingAddress: true,
    },
  });

  const firstName = dbUser?.firstName || "";
  const lastName = dbUser?.lastName || "";
  const username = dbUser?.username || session.user.email.split("@")[0];

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_45%)]" />
      <div className="space-y-8 rounded-3xl border border-border/40 bg-background/70 p-6 shadow-xl shadow-primary/10 backdrop-blur">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile, security preferences, and billing information.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto rounded-2xl border border-border/60 bg-background/60 p-1 backdrop-blur">
            <TabsTrigger
              value="profile"
              className="rounded-xl px-4 py-2 text-sm font-medium transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Edit Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="rounded-xl px-4 py-2 text-sm font-medium transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Security
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="rounded-xl px-4 py-2 text-sm font-medium transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Social Profiles
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="rounded-xl px-4 py-2 text-sm font-medium transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Billing Address
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileForm
              initialData={{
                firstName: firstName || username,
                lastName,
                username,
                email: session.user.email,
                phoneNumber: dbUser?.phoneNumber ?? "",
                designation: dbUser?.designation ?? "",
                bio: dbUser?.bio ?? "",
                image: dbUser?.image ?? undefined,
              }}
            />
          </TabsContent>

          <TabsContent value="security">
            <PasswordForm />
          </TabsContent>

          <TabsContent value="social">
            <SocialLinksForm
              initialData={{
                website: dbUser?.socialWebsite ?? "",
                github: dbUser?.socialGithub ?? "",
                facebook: dbUser?.socialFacebook ?? "",
                twitter: dbUser?.socialTwitter ?? "",
                linkedin: dbUser?.socialLinkedin ?? "",
              }}
            />
          </TabsContent>

          <TabsContent value="billing">
            <BillingAddressForm
              initialData={
                dbUser?.billingAddress
                  ? {
                      firstName: dbUser.billingAddress.firstName,
                      lastName: dbUser.billingAddress.lastName,
                      companyName: dbUser.billingAddress.companyName ?? "",
                      phoneNumber: dbUser.billingAddress.phoneNumber ?? "",
                      email: dbUser.billingAddress.email,
                      addressLine1: dbUser.billingAddress.addressLine1,
                      addressLine2: dbUser.billingAddress.addressLine2 ?? "",
                      city: dbUser.billingAddress.city,
                      state: dbUser.billingAddress.state,
                      postalCode: dbUser.billingAddress.postalCode,
                      country: dbUser.billingAddress.country,
                      vatNumber: dbUser.billingAddress.vatNumber ?? "",
                      notes: dbUser.billingAddress.notes ?? "",
                    }
                  : {
                      firstName: firstName || "",
                      lastName: lastName || "",
                      companyName: "",
                      phoneNumber: dbUser?.phoneNumber ?? "",
                      email: session.user.email,
                      addressLine1: "",
                      addressLine2: "",
                      city: "",
                      state: "",
                      postalCode: "",
                      country: "",
                      vatNumber: "",
                      notes: "",
                    }
              }
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

