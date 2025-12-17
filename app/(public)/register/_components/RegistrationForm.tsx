"use client";

import Link from "next/link";
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
import { Label } from "@/components/ui/label";
import { AlertCircle, User, Mail, Lock, UserCircle, GraduationCap, Loader2, Check } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useTransition, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const RegistrationSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be at most 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be at most 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .min(1, "Email is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be at most 100 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type RegistrationFormValues = z.infer<typeof RegistrationSchema>;

type AccountType = "student" | "teacher";

export default function RegistrationForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [accountType, setAccountType] = useState<AccountType>("student");
  const [isSubmitting, startRegistrationTransition] = useTransition();
  const [otp, setOtp] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [otpPending, startOtpTransition] = useTransition();
  const [resendPending, setResendPending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [accountTypeChanging, setAccountTypeChanging] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(RegistrationSchema),
    mode: "onChange",
  });

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
    if (step === 3) {
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
    if (otp.length === 6 && step === 3 && !otpPending) {
      verifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleAccountTypeChange = (type: AccountType) => {
    if (type === accountType || step !== 1) return;
    setAccountTypeChanging(true);
    setTimeout(() => {
      setAccountType(type);
      setTimeout(() => {
        setAccountTypeChanging(false);
      }, 400);
    }, 50);
  };

  const handleNextStep = async () => {
    if (step === 1) {
      // Validate step 1 fields
      const isValid = await trigger(["firstName", "lastName", "username"]);
      if (isValid) {
        setIsTransitioning(true);
        setTimeout(() => {
          setStep(2);
          setIsTransitioning(false);
        }, 300);
      }
    } else if (step === 2) {
      // Validate step 2 fields
      const isValid = await trigger(["email", "password", "confirmPassword"]);
      if (isValid) {
        // Submit registration and move to OTP step
        const formData = getValues();
        startRegistrationTransition(async () => {
          try {
            const response = await fetch("/api/student-registration/send-otp", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                username: formData.username.trim().toLowerCase(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                role: accountType === "teacher" ? "teacher" : "user",
              }),
            });

            const result = await response.json();

            if (result.status === "success") {
              setVerifiedEmail(formData.email.trim().toLowerCase());
              setIsTransitioning(true);
              setTimeout(() => {
                setStep(3);
                setIsTransitioning(false);
                toast.success("Verification code sent to your email!");
              }, 300);
            } else {
              toast.error(result.message || "Failed to send verification code");
            }
          } catch (error) {
            toast.error("An unexpected error occurred. Please try again.");
            console.error("Registration error:", error);
          }
        });
      }
    }
  };

  function verifyOtp() {
    if (otp.length !== 6 || otpPending) return;

    startOtpTransition(async () => {
      try {
        const response = await fetch("/api/student-registration/verify", {
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
          toast.success(result.message);
          setTimeout(() => {
            router.push("/login");
            router.refresh();
          }, 1500);
        } else {
          toast.error(result.message || "Invalid verification code");
          setOtp("");
        }
      } catch (error) {
        console.error("OTP verification error:", error);
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
      const formData = getValues();
      const response = await fetch("/api/student-registration/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          username: formData.username.trim().toLowerCase(),
          email: verifiedEmail,
          password: formData.password,
          role: accountType === "teacher" ? "teacher" : "user",
        }),
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

  function goToStep(stepNumber: 1 | 2 | 3) {
    if (stepNumber === 1 && step > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setStep(1);
        setIsTransitioning(false);
      }, 200);
    } else if (stepNumber === 2 && step === 3) {
      setIsTransitioning(true);
      setTimeout(() => {
        setStep(2);
        setIsTransitioning(false);
      }, 200);
    }
  }

  const renderField = (
    id: keyof RegistrationFormValues,
    label: string,
    type: "text" | "email" | "password" = "text",
    icon?: React.ReactNode,
    extraProps: Record<string, unknown> = {}
  ) => (
    <div>
      <Label htmlFor={id} className="text-sm font-medium text-foreground mb-2 block">
        {label}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <Input
          id={id}
          type={type}
          className={`h-12 text-base rounded-lg border border-border bg-transparent px-4 transition-all duration-200 ${
            icon ? "pl-11" : ""
          } ${
            errors[id]
              ? "border-destructive ring-2 ring-destructive/20 focus:border-destructive focus:ring-destructive/30"
              : "focus:ring-2 focus:ring-primary/20 focus:border-primary"
          }`}
          {...register(id)}
          {...extraProps}
          disabled={isSubmitting || isTransitioning || (step === 1 && id !== "firstName" && id !== "lastName" && id !== "username") || (step === 2 && id !== "email" && id !== "password" && id !== "confirmPassword")}
        />
      </div>
      {errors[id] && (step === 1 || (step === 2 && (id === "email" || id === "password" || id === "confirmPassword"))) && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-destructive animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          {errors[id]?.message}
        </p>
      )}
    </div>
  );

  const getStepIndicator = (stepNumber: 1 | 2 | 3) => {
    if (step > stepNumber) {
      return (
        <div className="bg-green-500 rounded-full w-10 h-10 text-white flex items-center justify-center transition-all duration-500 ease-in-out transform animate-scale-in">
          <Check className="size-5 animate-fade-in-delay" />
        </div>
      );
    } else if (step === stepNumber) {
      return (
        <div className="bg-primary rounded-full w-10 h-10 text-white flex items-center justify-center text-lg font-semibold transition-all duration-500 ease-in-out transform">
          {stepNumber}
        </div>
      );
    } else {
      return (
        <div className="bg-muted border border-border rounded-full w-10 h-10 text-muted-foreground flex items-center justify-center text-lg font-semibold transition-all duration-500 ease-in-out">
          {stepNumber}
        </div>
      );
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <Card className="w-full" style={{ width: 'calc(100% + 10px)', maxWidth: 'calc(100% + 10px)' }}>
        <CardContent className="pt-8 px-0">
          <div className="flex items-center w-full">
            <div className="w-full space-y-0">
              {/* Step 1: Personal Information */}
              <div className="flex items-start px-8">
                <div className="flex flex-col items-center">
                  {getStepIndicator(1)}
                  {/* Connecting line - Dynamic height based on content */}
                  <div className={`relative w-[2px] mt-4 overflow-hidden transition-all duration-500 ease-in-out ${
                    step === 1 ? "flex-1" : step > 1 ? "h-16" : "h-12"
                  }`}>
                    <div 
                      className={`w-full h-full rounded-full transition-all duration-500 ease-in-out ${
                        step === 1 
                          ? "bg-gradient-to-b from-primary/30 via-primary/10 to-border animate-pulse-glow" 
                          : step > 1
                          ? "bg-gradient-to-b from-green-500/40 via-green-500/20 to-border"
                          : "bg-border"
                      }`}
                    />
                    {step === 1 && (
                      <div 
                        className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-primary/70 to-transparent"
                        style={{
                          animation: 'shimmer 2s ease-in-out infinite',
                        }}
                      />
                    )}
                    {step > 1 && (
                      <div 
                        className="absolute inset-0 rounded-full bg-gradient-to-b from-green-500/60 via-green-500/40 to-green-500/20 animate-fill-down origin-top"
                      />
                    )}
                  </div>
                </div>
                <div className="pl-8 flex-1">
                  <div className={`transition-all duration-500 ease-in-out ${
                    step === 1 
                      ? "font-semibold text-lg opacity-100 translate-x-0" 
                      : step > 1
                      ? "text-muted-foreground font-semibold text-lg opacity-100 translate-x-0"
                      : "text-muted-foreground font-normal text-lg opacity-70"
                  }`}>
                    {step === 1 ? "Personal Information" : step > 1 ? "Personal Information" : "Personal Information"}
                  </div>
                  {step === 1 && (
                    <div className="mt-2 text-muted-foreground text-sm transition-all duration-300">
                      Enter your name and username
                    </div>
                  )}
                  {step > 1 && (
                    <div className="mt-2 text-muted-foreground text-xs font-normal animate-fade-in">
                      Completed
                    </div>
                  )}

                  {step === 1 && (
                    <div className={`mt-6 space-y-5 transition-all duration-500 ease-in-out ${
                      isTransitioning ? "opacity-0 -translate-x-4 pointer-events-none" : accountTypeChanging ? "opacity-95 scale-[0.995]" : "opacity-100 translate-x-0 scale-100"
                    }`}>
                      {/* Account Type Switcher */}
                      <div className="relative">
                        <Label className="text-sm font-medium text-foreground mb-3 block">Account Type</Label>
                        <div className="relative inline-flex rounded-xl bg-muted/50 p-1.5 w-full overflow-hidden border border-border/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
                          {/* Animated background with glow effect */}
                          <div
                            className={`absolute top-1.5 bottom-1.5 rounded-lg bg-primary transition-all duration-500 ease-out shadow-lg shadow-primary/30 ${
                              accountType === "student" 
                                ? "left-1.5 right-1/2 translate-x-0" 
                                : "left-1/2 right-1.5 translate-x-0"
                            }`}
                            style={{
                              transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                            }}
                          />
                          {/* Shimmer effect on active background */}
                          {accountTypeChanging && (
                            <div 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              style={{
                                animation: 'shimmer 1.5s ease-in-out',
                              }}
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => handleAccountTypeChange("student")}
                            disabled={isSubmitting || isTransitioning}
                            className={`relative z-10 flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-lg text-sm font-semibold transition-all duration-400 ease-out transform ${
                              accountType === "student"
                                ? "text-primary-foreground scale-[1.03] shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            } ${isSubmitting || isTransitioning ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"}`}
                            style={{
                              transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                            }}
                          >
                            <UserCircle className={`size-5 transition-all duration-400 ${
                              accountType === "student" ? "scale-125 rotate-0 drop-shadow-sm" : "scale-100"
                            }`} 
                            style={{
                              transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                            }}
                            />
                            <span className="transition-all duration-400 font-medium">Student Account</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAccountTypeChange("teacher")}
                            disabled={isSubmitting || isTransitioning}
                            className={`relative z-10 flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-lg text-sm font-semibold transition-all duration-400 ease-out transform ${
                              accountType === "teacher"
                                ? "text-primary-foreground scale-[1.03] shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            } ${isSubmitting || isTransitioning ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"}`}
                            style={{
                              transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                            }}
                          >
                            <GraduationCap className={`size-5 transition-all duration-400 ${
                              accountType === "teacher" ? "scale-125 rotate-0 drop-shadow-sm" : "scale-100"
                            }`}
                            style={{
                              transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                            }}
                            />
                            <span className="transition-all duration-400 font-medium">Teacher Account</span>
                          </button>
                        </div>
                      </div>

                      <div className={`grid gap-5 sm:grid-cols-2 transition-all duration-500 ease-in-out ${
                        accountTypeChanging ? "opacity-70 scale-[0.98]" : "opacity-100 scale-100"
                      }`}>
                        {renderField("firstName", "First Name", "text", <User className="size-5" />, {
                          placeholder: "John",
                        })}
                        {renderField("lastName", "Last Name", "text", <User className="size-5" />, {
                          placeholder: "Doe",
                        })}
                      </div>
                      <div className={`transition-all duration-500 ease-in-out ${
                        accountTypeChanging ? "opacity-70 scale-[0.98]" : "opacity-100 scale-100"
                      }`}>
                        {renderField("username", "Username", "text", <UserCircle className="size-5" />, {
                          placeholder: "johndoe",
                        })}
                      </div>
                      
                      {/* Continue Button with enhanced animations */}
                      <div className="relative pt-2">
                        <Button
                          type="button"
                          onClick={handleNextStep}
                          disabled={isSubmitting || isTransitioning}
                          className="relative w-full h-12 text-base font-semibold rounded-lg overflow-hidden group transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:hover:scale-100 disabled:opacity-70 disabled:cursor-not-allowed"
                          style={{
                            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                          }}
                        >
                          {/* Shine effect on hover */}
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                          {/* Button content */}
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <span>Continue</span>
                            <span className="group-hover:translate-x-1 transition-transform duration-300 ease-out">→</span>
                          </span>
                          {/* Pulse animation */}
                          {!isSubmitting && !isTransitioning && (
                            <span className="absolute inset-0 rounded-lg bg-primary/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Account Credentials */}
              <div className={`flex items-start px-8 transition-all duration-500 ease-in-out ${
                step === 1 ? "mt-4" : "mt-4"
              }`}>
                <div className="flex flex-col items-center">
                  {getStepIndicator(2)}
                  {/* Connecting line - Dynamic height based on content */}
                  <div className={`relative w-[2px] mt-4 overflow-hidden transition-all duration-500 ease-in-out ${
                    step === 2 ? "flex-1" : step > 2 ? "h-16" : "h-12"
                  }`}>
                    <div 
                      className={`w-full h-full rounded-full transition-all duration-500 ease-in-out ${
                        step === 2 
                          ? "bg-gradient-to-b from-primary/30 via-primary/10 to-border animate-pulse-glow" 
                          : step > 2
                          ? "bg-gradient-to-b from-green-500/40 via-green-500/20 to-border"
                          : "bg-border"
                      }`}
                    />
                    {step === 2 && (
                      <div 
                        className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-primary/70 to-transparent"
                        style={{
                          animation: 'shimmer 2s ease-in-out infinite',
                        }}
                      />
                    )}
                    {step > 2 && (
                      <div 
                        className="absolute inset-0 rounded-full bg-gradient-to-b from-green-500/60 via-green-500/40 to-green-500/20 animate-fill-down origin-top"
                      />
                    )}
                  </div>
                </div>
                <div className="pl-8 flex-1 min-w-0">
                  <div className={`transition-all duration-500 ease-in-out ${
                    step === 2 
                      ? "font-semibold text-lg opacity-100 translate-x-0" 
                      : step > 2
                      ? "text-muted-foreground font-semibold text-lg opacity-100 translate-x-0"
                      : "text-muted-foreground font-normal text-lg opacity-70"
                  }`}>
                    Account Credentials
                  </div>
                  {step === 2 && (
                    <div className="mt-2 text-muted-foreground text-sm transition-all duration-300">
                      Enter your email and password
                    </div>
                  )}
                  {step > 2 && (
                    <div className="mt-2 text-muted-foreground text-xs font-normal animate-fade-in">
                      Completed
                    </div>
                  )}
                  {step === 1 && (
                    <div className="mt-2 text-muted-foreground text-sm opacity-60 transition-all duration-300">
                      Enter your email and password
                    </div>
                  )}

                  {/* Content area - Only shows when step is active, with smooth animation */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    step === 2 
                      ? "max-h-[800px] opacity-100 mt-6" 
                      : "max-h-0 opacity-0 mt-0"
                  }`}>
                    <div className={`space-y-5 transition-all duration-500 ease-in-out ${
                      isTransitioning ? "opacity-0 -translate-x-4" : "opacity-100 translate-x-0"
                    }`}>
                      {renderField("email", "Email", "email", <Mail className="size-5" />, {
                        placeholder: "john@example.com",
                      })}
                      <div className="grid gap-5 sm:grid-cols-2">
                        {renderField(
                          "password",
                          "Password",
                          "password",
                          <Lock className="size-5" />,
                          { placeholder: "••••••" }
                        )}
                        {renderField(
                          "confirmPassword",
                          "Confirm Password",
                          "password",
                          <Lock className="size-5" />,
                          { placeholder: "••••••" }
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        By signing up, I agree with the website&apos;s{" "}
                        <Link href="#" className="text-primary font-medium hover:underline transition-colors">
                          Terms and Conditions
                        </Link>
                        .
                      </p>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => goToStep(1)}
                          disabled={isSubmitting || isTransitioning}
                          className="flex-1 h-12 text-base font-semibold rounded-lg transition-all duration-300"
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNextStep}
                          disabled={isSubmitting || isTransitioning}
                          className="flex-1 h-12 text-base font-semibold rounded-lg transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:opacity-70"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="size-4 animate-spin mr-2" />
                              Sending...
                            </>
                          ) : (
                            `Create ${accountType === "teacher" ? "Teacher" : "Student"} Account`
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  {step > 2 && (
                    <div className="mt-2 text-muted-foreground text-xs font-normal animate-fade-in">
                      Wrong email address?{" "}
                      <span
                        className="font-semibold text-primary cursor-pointer hover:underline transition-colors duration-200"
                        onClick={() => goToStep(2)}
                      >
                        Change email
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Verify Email */}
              <div className={`flex items-start px-8 transition-all duration-500 ease-in-out ${
                step <= 2 ? "mt-4" : "mt-4"
              }`}>
                <div className="flex flex-col items-center">
                  {getStepIndicator(3)}
                </div>
                <div className="pl-8 flex-1 min-w-0">
                  <div className={`transition-all duration-500 ease-in-out ${
                    step === 3 
                      ? "font-semibold text-lg opacity-100 translate-x-0" 
                      : "text-muted-foreground font-normal text-lg opacity-70"
                  }`}>
                    Verify your email
                  </div>
                  {step === 3 && (
                    <div className="mt-2 text-muted-foreground text-sm transition-all duration-500 ease-in-out animate-fade-in">
                      Please input the OTP code sent to <strong>{verifiedEmail}</strong>
                    </div>
                  )}
                  {step < 3 && (
                    <div className="mt-2 text-muted-foreground text-sm opacity-60 transition-all duration-300">
                      Please input the OTP code sent to your email
                    </div>
                  )}
                  
                  {/* Content area - Only shows when step is active, with smooth animation */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    step === 3 
                      ? "max-h-[400px] opacity-100 mt-6" 
                      : "max-h-0 opacity-0 mt-0"
                  }`}>
                    <div className={`transition-all duration-500 ease-in-out ${
                      isTransitioning ? "opacity-0 -translate-x-4" : "opacity-100 translate-x-0"
                    }`}>
                      <div className="flex flex-row mb-6 gap-2 items-center">
                        <InputOTP
                          value={otp}
                          onChange={(value) => setOtp(value)}
                          maxLength={6}
                          disabled={otpPending}
                          containerClassName="gap-2"
                        >
                          <InputOTPGroup className="gap-2">
                            <InputOTPSlot index={0} className="w-12 h-12 rounded-lg border-2 border-input font-semibold text-center text-lg transition-all duration-200 hover:scale-105 transform" />
                            <InputOTPSlot index={1} className="w-12 h-12 rounded-lg border-2 border-input font-semibold text-center text-lg transition-all duration-200 hover:scale-105 transform" />
                            <InputOTPSlot index={2} className="w-12 h-12 rounded-lg border-2 border-input font-semibold text-center text-lg transition-all duration-200 hover:scale-105 transform" />
                          </InputOTPGroup>
                          <InputOTPGroup className="gap-2">
                            <InputOTPSlot index={3} className="w-12 h-12 rounded-lg border-2 border-input font-semibold text-center text-lg transition-all duration-200 hover:scale-105 transform" />
                            <InputOTPSlot index={4} className="w-12 h-12 rounded-lg border-2 border-input font-semibold text-center text-lg transition-all duration-200 hover:scale-105 transform" />
                            <InputOTPSlot index={5} className="w-12 h-12 rounded-lg border-2 border-input font-semibold text-center text-lg transition-all duration-200 hover:scale-105 transform" />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      
                      <div className="flex text-muted-foreground text-sm items-center">
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Link - Outside the Card */}
      {step === 1 && (
        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline transition-colors"
            >
              Login
            </Link>
          </span>
        </div>
      )}
    </div>
  );
}
