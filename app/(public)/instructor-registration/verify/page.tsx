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
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { toast } from "sonner";

export default function InstructorVerifyPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Suspense>
          <InstructorVerify />
        </Suspense>
      </div>
    </div>
  );
}

function InstructorVerify() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [isVerifying, startVerification] = useTransition();
  const params = useSearchParams();
  const email = params.get("email") as string;
  const isOtpCompleted = otp.length === 6;

  async function verifyOtp() {
    if (!email) {
      toast.error("Email not found. Please register again.");
      router.push("/instructor-registration");
      return;
    }

    startVerification(async () => {
      try {
        const response = await fetch("/api/instructor-registration/verify", {
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
          toast.success(result.message);
          // Clear session storage
          sessionStorage.removeItem("instructorRegistration");
          // Redirect to login page
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("An unexpected error occurred. Please try again.");
        console.error("Verification error:", error);
      }
    });
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Verify your email</CardTitle>
        <CardDescription>
          We have sent a verification code to <strong>{email}</strong>. Please
          check your email and enter the 6-digit code below to complete your
          instructor registration.
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
          disabled={isVerifying || !isOtpCompleted}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            "Verify and Create Account"
          )}
        </Button>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => router.push("/instructor-registration")}
            className="text-sm"
          >
            Back to Registration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

