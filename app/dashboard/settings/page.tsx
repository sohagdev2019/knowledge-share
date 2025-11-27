import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "./_components/ProfileForm";
import { PasswordForm } from "./_components/PasswordForm";
import { SocialLinksForm } from "./_components/SocialLinksForm";

export default async function SettingsPage() {
  const sessionUser = await requireUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  });

  const firstName = dbUser?.firstName || sessionUser.firstName || "";
  const lastName = dbUser?.lastName || "";
  const username = dbUser?.username || sessionUser.email.split("@")[0];

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
              email: sessionUser.email,
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
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
              <CardDescription>
                Update your billing address information for payments and invoices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input placeholder="First Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input placeholder="Last Name" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input placeholder="Company Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input placeholder="Phone Number" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input placeholder="email@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Country <span className="text-destructive">*</span>
                    </Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usa">United States</SelectItem>
                        <SelectItem value="india">India</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>
                    Address Line 1 <span className="text-destructive">*</span>
                  </Label>
                  <Input placeholder="Address" />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 2</Label>
                  <Input placeholder="Apartment, suite, etc." />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input placeholder="City" />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      State/Province <span className="text-destructive">*</span>
                    </Label>
                    <Input placeholder="State/Province" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Postal Code <span className="text-destructive">*</span>
                    </Label>
                    <Input placeholder="Postal Code" />
                  </div>
                  <div className="space-y-2">
                    <Label>VAT Number</Label>
                    <Input placeholder="VAT Number" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea rows={4} placeholder="Any additional information..." />
                </div>

                <div className="flex justify-end">
                  <Button type="button">Update Billing Address</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

