"use client";

import { useActionState, useEffect } from "react";
import { updatePasswordAction, type PasswordFormState } from "../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useFormStatus } from "react-dom";

const idleState: PasswordFormState = { status: "idle" };

export function PasswordForm() {
  const [state, formAction] = useActionState(
    updatePasswordAction,
    idleState
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-background/80 via-background to-background shadow-2xl shadow-primary/10">
      <CardHeader className="relative space-y-3">
        <div className="absolute inset-0 opacity-20 blur-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="h-full w-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-rose-500/50 via-transparent to-transparent"
          />
        </div>
        <div className="relative">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription className="text-sm">
            Keep your account secure by updating your password regularly.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form
          action={formAction}
          className="space-y-6 rounded-2xl border border-border/50 bg-background/80 p-6 backdrop-blur"
        >
          <PasswordField
            label="Current Password"
            id="currentPassword"
            name="currentPassword"
            placeholder="Current password"
            autoComplete="current-password"
          />
          <PasswordField
            label="New Password"
            id="newPassword"
            name="newPassword"
            placeholder="New password"
            autoComplete="new-password"
          />
          <PasswordField
            label="Confirm New Password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Re-type new password"
            autoComplete="new-password"
          />

          <div className="flex flex-col gap-2">
            <SubmitButton />
            {state.status === "error" && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordField({
  label,
  id,
  name,
  placeholder,
  autoComplete,
}: {
  label: string;
  id: string;
  name: string;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className="space-y-2"
    >
      <Label htmlFor={id}>{label}</Label>
      <Input
        type="password"
        id={id}
        name={name}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="rounded-xl border border-border/70 bg-background/70 transition focus-visible:-translate-y-0.5 focus-visible:border-primary focus-visible:ring-primary/40"
        required
      />
    </motion.div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <div className="flex items-center gap-4">
      <Button
        type="submit"
        variant="destructive"
        disabled={pending}
        className="rounded-full px-6 py-1.5 font-semibold shadow-lg shadow-rose-500/30 transition hover:-translate-y-0.5 disabled:opacity-70"
      >
        <motion.span
          className="flex items-center gap-2"
          animate={
            pending
              ? { opacity: [0.6, 1, 0.6] }
              : { opacity: 1, transition: { duration: 0.2 } }
          }
          transition={{ duration: 1.2, repeat: pending ? Infinity : 0 }}
        >
          {pending ? "Updating..." : "Update Password"}
        </motion.span>
      </Button>
    </div>
  );
}

