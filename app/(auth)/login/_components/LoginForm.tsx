"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";

import { GithubIcon, Loader, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [githubPending, startGithubTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  async function signInWithGithub() {
    startGithubTransition(async () => {
      try {
        await signIn("github", {
          callbackUrl: "/",
        });
      } catch (error) {
        toast.error("Failed to sign in with GitHub");
        console.error("GitHub sign in error:", error);
      }
    });
  }

  async function signInWithPassword() {
    if (!identifier || !password) {
      toast.error("Please enter username/email and password");
      return;
    }

    startPasswordTransition(async () => {
      try {
        // First, verify password and send OTP
        const response = await fetch("/api/auth/password/send-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: identifier.trim(),
            password: password,
          }),
        });

        const result = await response.json();

        if (result.status === "success") {
          toast.success("Verification code sent to your email");
          // Redirect to OTP verification page
          router.push(`/verify-request?email=${encodeURIComponent(result.email)}&type=password`);
        } else {
          toast.error(result.message || "Invalid username/email or password");
        }
      } catch (error) {
        toast.error("An unexpected error occurred. Please try again.");
        console.error("Password login error:", error);
      }
    });
  }
  return (
    <Card>
        <CardHeader>
        <CardTitle className="text-xl">Welcome Back!</CardTitle>
        <CardDescription>
          Login with your GitHub account or email/password
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Button
          disabled={githubPending}
          onClick={signInWithGithub}
          className="w-full"
          variant="outline"
        >
          {githubPending ? (
            <>
              <Loader className="size-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <GithubIcon className="size-4" />
              Sign in with GitHub
            </>
          )}
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        {/* Password Login */}
        <div className="flex flex-col gap-3">
          <div className="grid gap-2">
            <Label htmlFor="identifier">Username or Email</Label>
            <Input
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              type="text"
              placeholder="username or email@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••"
              required
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  signInWithPassword();
                }
              }}
            />
          </div>

          <Button onClick={signInWithPassword} disabled={passwordPending}>
            {passwordPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Loader2 className="size-4" />
                <span>Login with Password</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
