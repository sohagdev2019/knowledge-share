"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { updateProfileAction, type ProfileFormState } from "../actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadIcon, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useFormStatus } from "react-dom";
import { motion } from "framer-motion";

type ProfileFormProps = {
  initialData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber?: string | null;
    designation?: string | null;
    bio?: string | null;
    image?: string | null;
  };
};

const idleState: ProfileFormState = { status: "idle" };

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, idleState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    }
    if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  const avatarSrc =
    initialData.image ?? `https://avatar.vercel.sh/${initialData.email}`;
  const avatarFallback =
    (initialData.firstName || initialData.username || initialData.email)
      .charAt(0)
      .toUpperCase();

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-background/80 via-background to-background shadow-2xl shadow-primary/5">
      <CardHeader className="relative space-y-3">
        <div className="absolute inset-0 opacity-20 blur-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="h-full w-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/40 via-transparent to-transparent"
          />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-2xl">Edit Profile</CardTitle>
            <CardDescription>
              Update your personal details, contact info, and short bio.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/80 p-5 backdrop-blur-md md:flex-row md:items-center md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Avatar className="h-24 w-24 border-2 border-primary/40 shadow-lg shadow-primary/10">
              <AvatarImage src={avatarSrc} alt={initialData.firstName} />
              <AvatarFallback className="text-xl font-semibold">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          <div className="flex flex-1 flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              PNG or JPG up to 800px. A friendly face helps others recognize you.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="group gap-2 rounded-full border border-primary/20 bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground"
              >
                <UploadIcon className="h-4 w-4 transition group-hover:-translate-y-0.5" />
                Upload
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="gap-2 rounded-full border border-border/80 text-muted-foreground transition hover:border-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        </div>

        <form
          action={formAction}
          className="grid gap-8 rounded-2xl border border-border/50 bg-background/80 p-6 shadow-inner shadow-primary/5 backdrop-blur"
        >
          <motion.div
            className="grid gap-4 md:grid-cols-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FloatingField label="First Name">
              <Input
                id="firstName"
                name="firstName"
                defaultValue={initialData.firstName}
                placeholder="First name"
                className="rounded-xl border border-border/70 bg-background/60 transition focus-visible:border-primary focus-visible:ring-primary/30"
                required
              />
            </FloatingField>
            <FloatingField label="Last Name">
              <Input
                id="lastName"
                name="lastName"
                defaultValue={initialData.lastName}
                placeholder="Last name"
                className="rounded-xl border border-border/70 bg-background/60 transition focus-visible:border-primary focus-visible:ring-primary/30"
              />
            </FloatingField>
          </motion.div>

          <motion.div
            className="grid gap-4 md:grid-cols-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FloatingField label="Username" hint="Used publicly across the platform">
              <Input
                id="username"
                name="username"
                defaultValue={initialData.username}
                placeholder="username"
                className="rounded-xl border border-border/70 bg-background/60 transition focus-visible:border-primary focus-visible:ring-primary/30"
                required
              />
            </FloatingField>
            <FloatingField label="Phone Number">
              <Input
                id="phoneNumber"
                name="phoneNumber"
                defaultValue={initialData.phoneNumber ?? ""}
                placeholder="Add phone number"
                className="rounded-xl border border-border/70 bg-background/60 transition focus-visible:border-primary focus-visible:ring-primary/30"
              />
            </FloatingField>
          </motion.div>

          <motion.div
            className="grid gap-4 md:grid-cols-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <FloatingField label="Designation">
              <Input
                id="designation"
                name="designation"
                placeholder="What do you focus on?"
                defaultValue={initialData.designation ?? ""}
                className="rounded-xl border border-border/70 bg-background/60 transition focus-visible:border-primary focus-visible:ring-primary/30"
              />
            </FloatingField>
            <FloatingField label="Email">
              <Input
                id="email"
                defaultValue={initialData.email}
                disabled
                className="rounded-xl border border-border/70 bg-muted/60 text-muted-foreground"
              />
            </FloatingField>
          </motion.div>

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={5}
              placeholder="Tell us about yourself..."
              defaultValue={initialData.bio ?? ""}
              className="rounded-2xl border border-border/70 bg-background/60 p-4 transition focus-visible:border-primary focus-visible:ring-primary/30"
            />
          </motion.div>

          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
          >
            <div className="flex items-center justify-between gap-3">
              <SubmitButton />
              {state.status === "error" && (
                <p className="text-sm text-destructive">{state.message}</p>
              )}
            </div>
          </motion.div>
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="rounded-full border border-primary/60 bg-primary/90 px-6 py-1.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:bg-primary focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-70"
    >
      <motion.span
        className="flex items-center gap-2"
        animate={
          pending
            ? { opacity: [0.7, 1, 0.7] }
            : { opacity: 1, transition: { duration: 0.2 } }
        }
        transition={{ duration: 1.2, repeat: pending ? Infinity : 0 }}
      >
        {pending && (
          <span className="h-2 w-2 shrink-0 animate-ping rounded-full bg-white" />
        )}
        {pending ? "Saving" : "Update Profile"}
      </motion.span>
    </Button>
  );
}

function FloatingField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <Label className="font-medium">{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

