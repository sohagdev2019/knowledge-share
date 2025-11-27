 "use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  updateSocialLinksAction,
  type SocialLinksFormState,
} from "../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

type SocialLinksFormProps = {
  initialData: Record<string, string | null>;
};

const idleState: SocialLinksFormState = { status: "idle" };

export function SocialLinksForm({ initialData }: SocialLinksFormProps) {
  const [state, formAction] = useActionState(updateSocialLinksAction, idleState);
  const [links, setLinks] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(initialData).map(([key, value]) => [key, value ?? ""])
    )
  );

  useEffect(() => {
    setLinks(
      Object.fromEntries(
        Object.entries(initialData).map(([key, value]) => [key, value ?? ""])
      )
    );
  }, [initialData]);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-background/80 via-background to-background shadow-2xl shadow-blue-500/10">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            ✨
          </div>
          <div>
            <CardTitle className="text-2xl">Social Profile Links</CardTitle>
            <CardDescription>
              Share the places people can connect with you across the web.
            </CardDescription>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Use full URLs (including <span className="font-semibold">https://</span>) so we can
          link to your profiles directly.
        </p>
      </CardHeader>
      <CardContent>
        <form
          action={formAction}
          className="grid gap-5 rounded-2xl border border-border/40 bg-background/80 p-6 backdrop-blur"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {socialFields.map(({ label, name, placeholder, icon, hint }) => {
              const filled = links[name]?.length;
              return (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                  className={cn(
                    "rounded-2xl border bg-background/60 p-4 transition",
                    filled
                      ? "border-primary/50 shadow-lg shadow-primary/10"
                      : "border-border/50"
                  )}
                >
                  <Label
                    htmlFor={name}
                    className="flex items-center gap-2 text-sm font-semibold"
                  >
                    <span className="text-lg">{icon}</span>
                    {label}
                  </Label>
                  <Input
                    id={name}
                    name={name}
                    type="url"
                    value={links[name] ?? ""}
                    onChange={(e) =>
                      setLinks((prev) => ({ ...prev, [name]: e.target.value }))
                    }
                    placeholder={placeholder}
                    className="mt-2 rounded-xl border border-border/60 bg-background/70 transition focus-visible:-translate-y-0.5 focus-visible:border-primary focus-visible:ring-primary/40"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
                </motion.div>
              );
            })}
          </div>

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

const socialFields = [
  {
    label: "Website",
    name: "website",
    placeholder: "https://example.com",
    icon: "🌐",
    hint: "Your portfolio or primary homepage.",
  },
  {
    label: "GitHub",
    name: "github",
    placeholder: "https://github.com/username",
    icon: "💻",
    hint: "Let students browse your code repositories.",
  },
  {
    label: "Facebook",
    name: "facebook",
    placeholder: "https://facebook.com/username",
    icon: "📘",
    hint: "Share your community presence.",
  },
  {
    label: "Twitter",
    name: "twitter",
    placeholder: "https://twitter.com/username",
    icon: "🐦",
    hint: "Announce updates and quick tips.",
  },
  {
    label: "LinkedIn",
    name: "linkedin",
    placeholder: "https://linkedin.com/in/username",
    icon: "💼",
    hint: "Showcase experience & credentials.",
  },
] as const;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <div className="flex items-center gap-4">
      <Button
        type="submit"
        className="rounded-full border border-primary/30 bg-primary/90 px-6 py-1.5 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 disabled:opacity-70"
        disabled={pending}
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
          {pending ? "Saving..." : "Update Profile"}
        </motion.span>
      </Button>
    </div>
  );
}

