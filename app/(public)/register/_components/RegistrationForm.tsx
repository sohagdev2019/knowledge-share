"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
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

export default function RegistrationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(RegistrationSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/student-registration/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          username: data.username.trim().toLowerCase(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        toast.success(result.message);
        // Store registration data in sessionStorage for verification page
        sessionStorage.setItem(
          "studentRegistration",
          JSON.stringify({
            email: data.email.trim().toLowerCase(),
          })
        );
        // Redirect to verification page
        router.push(
          `/register/verify?email=${encodeURIComponent(data.email.trim().toLowerCase())}`
        );
      } else {
        toast.error(result.message);
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Registration error:", error);
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "mt-1 h-9 rounded-lg border border-border bg-transparent px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition";

  const renderField = (
    id: keyof RegistrationFormValues,
    label: string,
    type: "text" | "email" | "password" = "text",
    extraProps: Record<string, unknown> = {}
  ) => (
    <div>
      <Label htmlFor={id} className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        className={`${inputClass} ${errors[id] ? "border-destructive ring-destructive" : ""}`}
        {...register(id)}
        {...extraProps}
        disabled={isSubmitting}
      />
      {errors[id] && (
        <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          {errors[id]?.message}
        </p>
      )}
    </div>
  );

  return (
    <>
      <div className="flex w-full px-6 pt-4">
        <div className="flex-1 rounded-t-lg border border-border bg-primary/10 px-3 py-1.5 text-center text-xs font-semibold text-primary">
          Student Account
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 pb-6 pt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {renderField("firstName", "First Name", "text", { placeholder: "John" })}
          {renderField("lastName", "Last Name", "text", { placeholder: "Doe" })}
        </div>
        {renderField("username", "Username", "text", { placeholder: "johndoe" })}
        {renderField("email", "Email", "email", { placeholder: "john@example.com" })}
        <div className="grid gap-4 sm:grid-cols-2">
          {renderField("password", "Password", "password", { placeholder: "••••••" })}
          {renderField("confirmPassword", "Confirm Password", "password", { placeholder: "••••••" })}
        </div>
        <p className="text-xs text-muted-foreground">
          By signing up, I agree with the website&apos;s{" "}
          <Link href="#" className="text-primary underline">
            Terms and Conditions
          </Link>
          .
        </p>
        <Button type="submit" size="lg" disabled={isSubmitting} className="h-10 w-full rounded-full text-sm">
          {isSubmitting ? "Creating..." : "Create Account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium">
            Login
          </Link>
        </p>
      </form>
    </>
  );
}

