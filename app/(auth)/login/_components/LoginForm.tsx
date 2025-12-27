"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2, Mail, Lock, Check, Github } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { signIn, useSession } from "next-auth/react";

export function LoginForm() {
  const router = useRouter();
  const { data: session, update, status } = useSession();
  const [loginPending, startLoginTransition] = useTransition();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [otpPending, startOtpTransition] = useTransition();
  const [resendPending, setResendPending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [githubPending, setGithubPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.replace("/");
    }
  }, [status, session, router]);

  const startCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(60);
    setCanResend(false);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (step === 2) {
      startCountdown();
    }
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [step, startCountdown]);

  // Auto-verify OTP when all 6 digits are entered
  useEffect(() => {
    if (otp.length === 6 && step === 2 && !otpPending) {
      verifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  async function signInWithCredentials() {
    if (!emailOrUsername) {
      toast.error("Please enter your email or username");
      return;
    }

    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    startLoginTransition(async () => {
      try {
        const response = await fetch("/api/auth/email/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailOrUsername: emailOrUsername.trim(),
            password: password,
          }),
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
          setVerifiedEmail(result.email);
          setIsTransitioning(true);
          // Add a small delay for smooth animation
          setTimeout(() => {
            setStep(2);
            setIsTransitioning(false);
            toast.success("Verification code sent to your email!");
          }, 300);
        } else {
          toast.error(result.message || "Failed to send verification code");
        }
      } catch (error) {
        toast.error("An unexpected error occurred. Please try again.");
        console.error("Login error:", error);
      }
    });
  }

  function verifyOtp() {
    if (otp.length !== 6 || otpPending) return;

    startOtpTransition(async () => {
      try {
        const response = await fetch("/api/auth/email/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: verifiedEmail,
            otp: otp,
          }),
        });

        const result = await response.json();

        if (result.status === "success") {
          const signInResult = await signIn("credentials", {
            email: result.user.email,
            redirect: false,
          });

          if (signInResult?.ok) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            await update();
            toast.success("Login successful!");
            setTimeout(() => {
              router.push("/");
              router.refresh();
            }, 200);
          } else {
            console.error("Sign in result:", signInResult);
            toast.error("Failed to create session. Please try again.");
          }
        } else {
          toast.error(result.message || "Invalid verification code");
          setOtp("");
        }
      } catch (error) {
        console.error("Email OTP verification error:", error);
        toast.error("An error occurred. Please try again.");
        setOtp("");
      }
    });
  }

  async function resendOtp() {
    if (!verifiedEmail || resendPending || !canResend) {
      return;
    }

    setResendPending(true);
    try {
      const response = await fetch("/api/auth/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: verifiedEmail }),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast.success(result.message || "A new code has been sent.");
        startCountdown();
        setOtp("");
      } else {
        toast.error(result.message || "Unable to resend the code right now.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend the verification code. Please try again.");
    } finally {
      setResendPending(false);
    }
  }

  function changeEmail() {
    setStep(1);
    setOtp("");
    setVerifiedEmail("");
    setPassword("");
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }

  async function handleGithubLogin() {
    setGithubPending(true);
    try {
      await signIn("github", { callbackUrl: "/" });
    } catch (error) {
      toast.error("Failed to sign in with GitHub");
      setGithubPending(false);
    }
  }

  async function handleGoogleLogin() {
    setGooglePending(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      toast.error("Failed to sign in with Google");
      setGooglePending(false);
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <Card className="w-full" style={{ width: 'calc(100% + 10px)', maxWidth: 'calc(100% + 10px)' }}>
        <CardContent className="pt-6 px-0">
          <div className="flex items-center w-full">
            <div className="w-full space-y-0">
              {/* Step 1: Sign in with Email */}
              <div className="flex items-start px-6">
                <div className="flex flex-col items-center">
                  {step === 1 ? (
                    <div className="bg-primary rounded-full w-9 h-9 text-white flex items-center justify-center text-base font-semibold transition-all duration-500 ease-in-out transform">
                      1
                    </div>
                  ) : (
                    <div className="bg-green-500 rounded-full w-9 h-9 text-white flex items-center justify-center transition-all duration-500 ease-in-out transform animate-scale-in">
                      <Check className="size-5 animate-fade-in-delay" />
                    </div>
                  )}
                  {/* Connecting line - modern animated gradient connector */}
                  <div className="relative w-[2px] min-h-[110px] mt-3 overflow-hidden">
                    {/* Base gradient line */}
                    <div 
                      className={`w-full h-full rounded-full transition-all duration-500 ease-in-out ${
                        step === 1 
                          ? "bg-gradient-to-b from-primary/30 via-primary/10 to-border animate-pulse-glow" 
                          : "bg-gradient-to-b from-green-500/40 via-green-500/20 to-border"
                      }`}
                    />
                    {/* Animated shimmer overlay - only when step 1 is active */}
                    {step === 1 && (
                      <div 
                        className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-primary/70 to-transparent"
                        style={{
                          animation: 'shimmer 2s ease-in-out infinite',
                        }}
                      />
                    )}
                    {/* Fill animation when transitioning to step 2 */}
                    {step === 2 && (
                      <div 
                        className="absolute inset-0 rounded-full bg-gradient-to-b from-green-500/60 via-green-500/40 to-green-500/20 animate-fill-down origin-top"
                      />
                    )}
                  </div>
                </div>
                <div className="pl-7 flex-1">
                  <div className={`transition-all duration-500 ease-in-out ${
                    step === 1 
                      ? "font-semibold text-base opacity-100 translate-x-0" 
                      : "text-muted-foreground font-semibold text-base opacity-100 translate-x-0"
                  }`}>
                    {step === 1 ? "Sign in with Email" : "OTP sent to "}
                    {step === 2 && <span className="font-bold text-foreground">{verifiedEmail}</span>}
                  </div>
                  {step === 1 && (
                    <div className="mt-1 text-muted-foreground text-sm transition-all duration-300">
                      Please input your email address
                    </div>
                  )}
                  {step === 2 && (
                    <div className="mt-1 text-muted-foreground text-xs font-normal animate-fade-in">
                      Wrong email address?{" "}
                      <span
                        className="font-semibold text-primary cursor-pointer hover:underline transition-colors duration-200"
                        onClick={changeEmail}
                      >
                        Change email
                      </span>
                    </div>
                  )}

                  {step === 1 && (
                    <div className={`mt-4 space-y-3 transition-all duration-500 ease-in-out ${
                      isTransitioning ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0"
                    }`}>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          value={emailOrUsername}
                          onChange={(e) => setEmailOrUsername(e.target.value)}
                          type="text"
                          placeholder="Email"
                          className="pl-9 transition-all duration-200"
                          required
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && password) {
                              signInWithCredentials();
                            }
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Password"
                            className="pl-9 transition-all duration-200"
                            required
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && emailOrUsername && password) {
                                signInWithCredentials();
                              }
                            }}
                          />
                        </div>
                        <Button
                          onClick={signInWithCredentials}
                          disabled={loginPending}
                          className="shrink-0 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:opacity-70 transform"
                        >
                          {loginPending ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              <span className="ml-2">Sending...</span>
                            </>
                          ) : (
                            <span className="transition-all duration-200">Send</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Input your OTP - Always visible, disabled when step === 1 */}
              <div className={`flex items-start px-6 transition-all duration-500 ease-in-out ${
                step === 1 ? "mt-6" : "mt-6"
              }`}>
                <div className="flex flex-col items-center">
                  {step === 1 ? (
                    <div className="bg-muted border border-border rounded-full w-9 h-9 text-muted-foreground flex items-center justify-center text-base font-semibold transition-all duration-500 ease-in-out">
                      2
                    </div>
                  ) : (
                    <div className="bg-primary rounded-full w-9 h-9 text-white flex items-center justify-center text-base font-semibold transition-all duration-500 ease-in-out transform animate-scale-in">
                      2
                    </div>
                  )}
                </div>
                <div className="pl-7 flex-1">
                  <div className={`transition-all duration-500 ease-in-out ${
                    step === 1 
                      ? "text-muted-foreground font-normal text-base opacity-70" 
                      : "font-semibold text-base opacity-100"
                  }`}>
                    Input your OTP
                  </div>
                  {step === 1 ? (
                    <div className="mt-1 text-muted-foreground text-sm opacity-60 transition-all duration-300">
                      Please input the OTP code sent to the email
                    </div>
                  ) : (
                    <div className="mt-1 text-muted-foreground text-sm transition-all duration-500 ease-in-out animate-fade-in">
                      Please input the OTP code sent to the email
                    </div>
                  )}
                  
                  {step === 2 && (
                    <div className="flex flex-row my-5 gap-2 items-center transition-all duration-500 ease-in-out animate-fade-in-up">
                      <InputOTP
                        value={otp}
                        onChange={(value) => setOtp(value)}
                        maxLength={6}
                        disabled={otpPending}
                        containerClassName="gap-2"
                      >
                        <InputOTPGroup className="gap-2">
                          <InputOTPSlot index={0} className="w-10 h-10 rounded-l border-2 border-input font-semibold text-center transition-all duration-200 hover:scale-105 transform" />
                          <InputOTPSlot index={1} className="w-10 h-10 border-2 border-input font-semibold text-center transition-all duration-200 hover:scale-105 transform" />
                          <InputOTPSlot index={2} className="w-10 h-10 border-2 border-input font-semibold text-center transition-all duration-200 hover:scale-105 transform" />
                        </InputOTPGroup>
                        <InputOTPGroup className="gap-2">
                          <InputOTPSlot index={3} className="w-10 h-10 border-2 border-input font-semibold text-center transition-all duration-200 hover:scale-105 transform" />
                          <InputOTPSlot index={4} className="w-10 h-10 border-2 border-input font-semibold text-center transition-all duration-200 hover:scale-105 transform" />
                          <InputOTPSlot index={5} className="w-10 h-10 rounded-r border-2 border-input font-semibold text-center transition-all duration-200 hover:scale-105 transform" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  )}
                  
                  {step === 2 && (
                    <div className="flex text-muted-foreground text-xs items-center transition-all duration-500 ease-in-out animate-fade-in">
                      Didn't receive the OTP?{" "}
                      {canResend && !resendPending ? (
                        <span
                          className="text-primary font-semibold cursor-pointer hover:underline ml-1 transition-all duration-200 hover:scale-105 transform"
                          onClick={resendOtp}
                        >
                          Resend OTP
                        </span>
                      ) : resendPending ? (
                        <span className="text-primary font-semibold ml-1">
                          <Loader2 className="size-3 inline animate-spin mr-1" />
                          Sending...
                        </span>
                      ) : (
                        <span className="text-muted-foreground ml-1">
                          Resend OTP ({countdown}s)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Divider and Create Account Link - Outside the Card */}
      {step === 1 && (
        <>
          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Create Account Link */}
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              New in Edupeak?{" "}
              <Link
                href="/register"
                className="text-primary font-medium hover:underline transition-colors"
              >
                Create an account
              </Link>
            </span>
          </div>
        </>
      )}

      {/* OAuth Buttons - Outside the Card */}
      {step === 1 && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={githubPending || googlePending}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-md bg-[#2B2D2F] dark:bg-[#2B2D2F] border border-[#3F4143] text-white font-normal transition-all duration-200 hover:bg-[#353739] active:bg-[#2B2D2F] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googlePending ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="size-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleGithubLogin}
            disabled={githubPending || googlePending}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-md bg-[#2B2D2F] dark:bg-[#2B2D2F] border border-[#3F4143] text-white font-normal transition-all duration-200 hover:bg-[#353739] active:bg-[#2B2D2F] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {githubPending ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Github className="size-5 text-white" />
                <span>Continue with GitHub</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
