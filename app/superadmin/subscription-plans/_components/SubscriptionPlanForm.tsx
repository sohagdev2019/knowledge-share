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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, SparkleIcon, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import slugify from "slugify";
import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { createSubscriptionPlan, updateSubscriptionPlan } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SubscriptionPlanDetailType } from "@/app/data/admin/get-subscription-plan";

// USD to BDT exchange rate (can be made configurable via env variable)
const USD_TO_BDT_RATE = 110; // Default rate, update as needed

const subscriptionPlanSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  planType: z.enum(["Personal", "Team", "Enterprise"]),
  priceMonthly: z
    .union([z.coerce.number().min(0), z.literal(""), z.null()])
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional(),
  priceYearly: z
    .union([z.coerce.number().min(0), z.literal(""), z.null()])
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional(),
  stripePriceIdMonthly: z.string().optional(),
  stripePriceIdYearly: z.string().optional(),
  isActive: z.boolean(),
  isPopular: z.boolean(),
  trialDays: z.coerce.number().min(0).max(15).default(7),
  maxCourseAccess: z
    .union([z.coerce.number().min(1), z.literal(""), z.null()])
    .transform((val) => (val === "" || val === null ? null : val))
    .nullable(),
  allowsDownloads: z.boolean(),
  allowsCertificates: z.boolean(),
  allowsLiveClasses: z.boolean(),
  maxLiveQASessions: z
    .union([z.coerce.number().min(1), z.literal(""), z.null()])
    .transform((val) => (val === "" || val === null ? null : val))
    .nullable(),
  allowsTeamAccess: z.boolean(),
  teamSeats: z.coerce.number().min(1).default(1),
  allowsTeamManagement: z.boolean(),
  prioritySupport: z.boolean(),
  maxPrioritySupportTickets: z
    .union([z.coerce.number().min(1), z.literal(""), z.null()])
    .transform((val) => (val === "" || val === null ? null : val))
    .nullable(),
  allowsProgressTracking: z.boolean(),
  allowsCommunitySupport: z.boolean(),
  featureList: z.array(z.string()).optional().default([]),
}).refine(
  (data) => {
    // Enterprise plans don't need prices
    if (data.planType === "Enterprise") {
      return true;
    }
    // For Personal and Team plans, at least one price must be provided
    return data.priceMonthly !== null && data.priceMonthly !== undefined && data.priceMonthly > 0 ||
           data.priceYearly !== null && data.priceYearly !== undefined && data.priceYearly > 0;
  },
  {
    message: "At least one price (monthly or yearly) is required for Personal and Team plans",
    path: ["priceMonthly"],
  }
);

type SubscriptionPlanFormData = z.infer<typeof subscriptionPlanSchema>;

interface SubscriptionPlanFormProps {
  plan?: SubscriptionPlanDetailType;
}

export function SubscriptionPlanForm({ plan }: SubscriptionPlanFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEditing = !!plan;

  // Component for creating/editing subscription plans

  const form = useForm<SubscriptionPlanFormData>({
    resolver: zodResolver(subscriptionPlanSchema),
    defaultValues: plan
      ? {
          name: plan.name,
          slug: plan.slug,
          description: plan.description || "",
          planType: (plan as any).planType || "Personal",
          priceMonthly: plan.priceMonthly ? plan.priceMonthly / 100 : null, // Convert cents to dollars for display
          priceYearly: plan.priceYearly ? plan.priceYearly / 100 : null, // Convert cents to dollars for display
          stripePriceIdMonthly: plan.stripePriceIdMonthly || "",
          stripePriceIdYearly: plan.stripePriceIdYearly || "",
          isActive: plan.isActive,
          isPopular: plan.isPopular,
          trialDays: plan.trialDays,
          maxCourseAccess: plan.maxCourseAccess ?? "",
          allowsDownloads: plan.allowsDownloads,
          allowsCertificates: plan.allowsCertificates,
          allowsLiveClasses: plan.allowsLiveClasses,
          maxLiveQASessions: plan.maxLiveQASessions ?? "",
          allowsTeamAccess: plan.allowsTeamAccess,
          teamSeats: plan.teamSeats,
          allowsTeamManagement: plan.allowsTeamManagement,
          prioritySupport: plan.prioritySupport,
          maxPrioritySupportTickets: plan.maxPrioritySupportTickets ?? "",
          allowsProgressTracking: plan.allowsProgressTracking,
          allowsCommunitySupport: plan.allowsCommunitySupport,
          featureList: (plan.features as { list?: string[] } | null)?.list || [],
        }
      : {
          name: "",
          slug: "",
          description: "",
          planType: "Personal" as const,
          priceMonthly: null,
          priceYearly: null,
          stripePriceIdMonthly: "",
          stripePriceIdYearly: "",
          isActive: true,
          isPopular: false,
          trialDays: 7,
          maxCourseAccess: "",
          allowsDownloads: false,
          allowsCertificates: false,
          allowsLiveClasses: false,
          maxLiveQASessions: "",
          allowsTeamAccess: false,
          teamSeats: 1,
          allowsTeamManagement: false,
          prioritySupport: false,
          maxPrioritySupportTickets: "",
          allowsProgressTracking: false,
          allowsCommunitySupport: false,
          featureList: [],
        },
  });

  const onSubmit = (values: SubscriptionPlanFormData) => {
    startTransition(async () => {
      // Convert dollars to cents before saving, or set to null if not provided
      const valuesInCents = {
        ...values,
        priceMonthly: values.priceMonthly !== null && values.priceMonthly !== undefined 
          ? Math.round(values.priceMonthly * 100) 
          : null,
        priceYearly: values.priceYearly !== null && values.priceYearly !== undefined 
          ? Math.round(values.priceYearly * 100) 
          : null,
      };
      
      const action = isEditing
        ? updateSubscriptionPlan(plan.id, valuesInCents)
        : createSubscriptionPlan(valuesInCents);

      const { data: result, error } = await tryCatch(action);

      if (error) {
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }

      if (result.status === "success") {
        toast.success(result.message);
        router.push("/superadmin/subscription-plans");
        router.refresh();
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Subscription Plan" : "Create Subscription Plan"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Update subscription plan details"
            : "Create a new subscription plan for your platform"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Pro, Business" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 items-end">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="pro, business" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL-friendly identifier (auto-generated from name)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const nameValue = form.getValues("name");
                    const slug = slugify(nameValue, { lower: true });
                    form.setValue("slug", slug, { shouldValidate: true });
                  }}
                >
                  Generate <SparkleIcon className="ml-1 h-4 w-4" />
                </Button>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the plan"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="planType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Personal">Personal Plan</SelectItem>
                        <SelectItem value="Team">Team Plan</SelectItem>
                        <SelectItem value="Enterprise">Enterprise Plan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Enterprise plans require contacting sales for pricing
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pricing */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">Pricing</h3>
              {form.watch("planType") === "Enterprise" ? (
                <div className="p-4 border rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">
                    Enterprise plans require contacting sales for pricing. Users will see "Contact sales for pricing" instead of a direct purchase option.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Enter prices in USD. Will be converted to BDT below and stored in cents. At least one price (monthly or yearly) is required.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priceMonthly"
                      render={({ field }) => {
                        const dollarValue = field.value || 0;
                        const bdtValue = dollarValue * USD_TO_BDT_RATE;
                        return (
                          <FormItem>
                            <FormLabel>Monthly Price (USD)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="29.99"
                                {...field}
                                value={field.value === null ? "" : field.value}
                                onChange={(e) => {
                                  const value = e.target.value === "" ? null : (parseFloat(e.target.value) || 0);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            {field.value !== null && field.value !== undefined && field.value > 0 && (
                              <div className="space-y-1">
                                <FormDescription className="text-green-600 dark:text-green-400">
                                  ${dollarValue.toFixed(2)}/month
                                </FormDescription>
                                <FormDescription className="text-blue-600 dark:text-blue-400">
                                  ৳{bdtValue.toFixed(2)}/month (BDT)
                                </FormDescription>
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="priceYearly"
                      render={({ field }) => {
                        const dollarValue = field.value || 0;
                        const bdtValue = dollarValue * USD_TO_BDT_RATE;
                        return (
                          <FormItem>
                            <FormLabel>Yearly Price (USD)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="299.99"
                                {...field}
                                value={field.value === null ? "" : field.value}
                                onChange={(e) => {
                                  const value = e.target.value === "" ? null : (parseFloat(e.target.value) || 0);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            {field.value !== null && field.value !== undefined && field.value > 0 && (
                              <div className="space-y-1">
                                <FormDescription className="text-green-600 dark:text-green-400">
                                  ${dollarValue.toFixed(2)}/year
                                </FormDescription>
                                <FormDescription className="text-blue-600 dark:text-blue-400">
                                  ৳{bdtValue.toFixed(2)}/year (BDT)
                                </FormDescription>
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </>
              )}

              {form.watch("planType") !== "Enterprise" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stripePriceIdMonthly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stripe Monthly Price ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="price_xxx (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stripePriceIdYearly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stripe Yearly Price ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="price_xxx (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>


            {/* Custom Feature List */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">Feature List (For Pricing Page)</h3>
              <p className="text-sm text-muted-foreground">
                Add custom feature descriptions that will be displayed on the pricing page. 
                These will override the auto-generated features.
              </p>
              
              <FormField
                control={form.control}
                name="featureList"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Features</FormLabel>
                    <div className="space-y-2">
                      {field.value?.map((feature, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <FormControl>
                            <Input
                              placeholder="e.g., Access to 30,000+ top courses"
                              value={feature}
                              onChange={(e) => {
                                const newList = [...(field.value || [])];
                                newList[index] = e.target.value;
                                field.onChange(newList);
                              }}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newList = field.value?.filter((_, i) => i !== index) || [];
                              field.onChange(newList);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          field.onChange([...(field.value || []), ""]);
                        }}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Feature
                      </Button>
                    </div>
                    <FormDescription>
                      Add features one per line. Examples: "Access to 30,000+ top courses", "Certification prep", "AI-powered coding exercises"
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Settings */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">Settings</h3>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Plan is available for purchase
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPopular"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Most Popular</FormLabel>
                      <FormDescription>
                        Show "Most Popular" badge on pricing page
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? (
                <>
                  {isEditing ? "Updating..." : "Creating..."}
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>{isEditing ? "Update Plan" : "Create Plan"}</>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

