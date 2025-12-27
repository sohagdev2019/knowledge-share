"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Building2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

function ContactForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form from URL parameters
  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    const messageParam = searchParams.get("message");
    
    if (subjectParam) {
      setSubject(subjectParam);
    }
    if (messageParam) {
      setMessage(decodeURIComponent(messageParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          subject,
          message,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast.success(data.message || "Message sent successfully!");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        toast.error(data.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-12 pt-8 md:pt-16">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Get in touch
        </h1>
        <p className="text-lg text-muted-foreground">
          Have questions about EduPeak? We're here to help.
        </p>
      </div>

      {/* Contact Form Section */}
      <section className="pb-12">
        <div className="max-w-xl mx-auto px-4">
          <form
            onSubmit={handleSubmit}
            className="p-6 md:p-8 rounded-2xl border border-border/50 bg-white dark:bg-zinc-900"
          >
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium mb-2"
                >
                  How can we help?
                </label>
                <Select required value={subject} onValueChange={setSubject}>
                  <SelectTrigger
                    id="subject"
                    className="w-full h-11 px-4 rounded-xl"
                  >
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales Inquiry">
                      Sales / Pricing Question
                    </SelectItem>
                    <SelectItem value="Technical Support">
                      Technical Support
                    </SelectItem>
                    <SelectItem value="Account Issue">Account Issue</SelectItem>
                    <SelectItem value="Partnership">
                      Partnership Opportunity
                    </SelectItem>
                    <SelectItem value="Feature Request">
                      Feature Request
                    </SelectItem>
                    <SelectItem value="Bug Report">Bug Report</SelectItem>
                    <SelectItem value="Resume Submission">
                      Resume Submission
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2"
                >
                  Message
                </label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  placeholder="Tell us more about how we can help..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Sending..." : "Send message"}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="mb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Sales Contact Card */}
            <Card className="p-6 rounded-2xl border border-border/50 bg-white dark:bg-zinc-900">
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Building2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <a
                      href="mailto:sales@edupeak.com"
                      className="text-lg font-semibold hover:underline block mb-2"
                    >
                      sales@edupeak.com
                    </a>
                    <p className="text-sm text-muted-foreground">
                      Plans, pricing, enterprise contracts, or demos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Contact Card */}
            <Card className="p-6 rounded-2xl border border-border/50 bg-white dark:bg-zinc-900">
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <MessageCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <a
                      href="mailto:support@edupeak.com"
                      className="text-lg font-semibold hover:underline block mb-2"
                    >
                      support@edupeak.com
                    </a>
                    <p className="text-sm text-muted-foreground">
                      Product questions, report problems, or feedback
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="text-center mt-16">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Learning Today
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Explore thousands of courses and advance your career with EduPeak.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/register">Get started free</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="pb-12 pt-8 md:pt-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Get in touch
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions about EduPeak? We're here to help.
            </p>
          </div>
          <div className="max-w-xl mx-auto px-4">
            <div className="p-6 md:p-8 rounded-2xl border border-border/50 bg-white dark:bg-zinc-900 animate-pulse">
              <div className="space-y-5">
                <div className="h-11 bg-muted rounded-xl" />
                <div className="h-11 bg-muted rounded-xl" />
                <div className="h-32 bg-muted rounded-xl" />
                <div className="h-11 bg-muted rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ContactForm />
    </Suspense>
  );
}
