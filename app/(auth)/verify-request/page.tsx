"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { toast } from "sonner";

export default function VerifyRequestRoute() {
  return (
    <Suspense>
      <VerifyRequest />
    </Suspense>
  );
}

function VerifyRequest() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [emailPending, startTranstion] = useTransition();
  const params = useSearchParams();
  const email = params.get("email") as string;
  const loginType = params.get("type") as string; // "password" or null (email OTP)
  const isOtpCompleted = otp.length === 6;

  function verifyOtp() {
    startTranstion(async () => {
      // If password login, use password verify endpoint
      if (loginType === "password") {
        try {
          const response = await fetch("/api/auth/password/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
              otp: otp,
            }),
          });

          const result = await response.json();

          if (result.status === "success") {
            toast.success("Login successful!");
            // Reload the page to get the new session
            window.location.href = "/";
          } else {
            toast.error(result.message);
          }
        } catch (error) {
          toast.error("An unexpected error occurred. Please try again.");
          console.error("Verification error:", error);
        }
      } else {
        // Email OTP login
        await authClient.signIn.emailOtp({
          email: email,
          otp: otp,
          fetchOptions: {
            onSuccess: () => {
              toast.success("Email verified");
              router.push("/");
            },
            onError: () => {
              toast.error("Error verifying Email/OTP");
            },
          },
        });
      }
    });
  }
  return (
    <Card className="w-full mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Please check your email</CardTitle>
        <CardDescription>
          We have sent a verification email code to your email address. Please
          open the email and paste the code below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <InputOTP
            value={otp}
            onChange={(value) => setOtp(value)}
            maxLength={6}
            className="gap-2"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <Button
          onClick={verifyOtp}
          disabled={emailPending || !isOtpCompleted}
          className="w-full"
        >
          {emailPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            "Verify Account"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
