import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { mapPriceIdToPlanCode } from "@/lib/subscription-utils";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();

  const headersList = await headers();

  const signature = headersList.get("Stripe-Signature") as string;

  // Check if Stripe webhook secret is configured
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe webhook secret not configured");
    return new Response("Stripe webhook not configured", { status: 501 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return new Response("Webhook error", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // ============================================
  // ORG-BASED SUBSCRIPTION WEBHOOK HANDLERS
  // ============================================

  // A) checkout.session.completed - Handle org subscription checkout
  if (event.type === "checkout.session.completed") {
    // Check if this is an org-based subscription checkout
    if (session.mode === "subscription" && session.metadata?.orgId) {
      try {
        const orgId = session.metadata.orgId;
        const planCode = session.metadata.planCode as string;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        if (!orgId || !customerId) {
          console.error("Missing required metadata for org subscription", {
            sessionId: session.id,
            metadata: session.metadata,
          });
          return new Response("Missing required metadata", { status: 400 });
        }

        // Get subscription from Stripe
        const stripeSubscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (!stripeSubscriptionId) {
          console.error("Subscription ID not found in session", {
            sessionId: session.id,
          });
          return new Response("Subscription ID not found", { status: 400 });
        }

        const stripeSubscription = await stripe.subscriptions.retrieve(
          stripeSubscriptionId
        );

        // Get price ID and map to plan code
        const priceId =
          stripeSubscription.items.data[0]?.price.id || session.metadata.priceId;
        const mappedPlanCode = planCode || mapPriceIdToPlanCode(priceId || "");

        if (!mappedPlanCode) {
          console.error("Could not map price ID to plan code", {
            priceId,
            sessionId: session.id,
          });
          return new Response("Invalid plan code", { status: 400 });
        }

        // Create or update subscription
        await prisma.$transaction(async (tx) => {
          const currentPeriodStart = new Date(
            stripeSubscription.current_period_start * 1000
          );
          const currentPeriodEnd = new Date(
            stripeSubscription.current_period_end * 1000
          );

          await tx.subscription.upsert({
            where: { orgId },
            update: {
              planCode: mappedPlanCode,
              status: stripeSubscription.status === "trialing" ? "Trialing" : "Active",
              currentPeriodStart,
              currentPeriodEnd,
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
              stripeCustomerId: customerId,
              stripeSubscriptionId: stripeSubscriptionId,
              stripePriceId: priceId || null,
              updatedAt: new Date(),
            },
            create: {
              orgId,
              planCode: mappedPlanCode,
              status: stripeSubscription.status === "trialing" ? "Trialing" : "Active",
              currentPeriodStart,
              currentPeriodEnd,
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
              stripeCustomerId: customerId,
              stripeSubscriptionId: stripeSubscriptionId,
              stripePriceId: priceId || null,
            },
          });
        });

        console.log("Org subscription created/updated successfully", {
          orgId,
          planCode: mappedPlanCode,
          stripeSubscriptionId,
        });

        return new Response(null, { status: 200 });
      } catch (error) {
        console.error("Error processing org subscription checkout:", error);
        return new Response("Internal server error", { status: 500 });
      }
    }

    // Check if this is a subscription checkout (legacy user-based)
    if (session.mode === "subscription") {
      try {
        const planId = session.metadata?.planId;
        const userId = session.metadata?.userId;
        const billingCycle = session.metadata?.billingCycle as "monthly" | "yearly" | undefined;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        if (!planId || !userId || !customerId) {
          console.error("Missing required metadata for subscription", {
            sessionId: session.id,
            metadata: session.metadata,
          });
          return new Response("Missing required metadata", { status: 400 });
        }

        // Get subscription from Stripe
        const stripeSubscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (!stripeSubscriptionId) {
          console.error("Subscription ID not found in session", {
            sessionId: session.id,
          });
          return new Response("Subscription ID not found", { status: 400 });
        }

        const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

        // Get plan
        const plan = await prisma.subscriptionPlan.findUnique({
          where: { id: planId },
        });

        if (!plan) {
          console.error("Plan not found", { planId });
          return new Response("Plan not found", { status: 404 });
        }

        // Create or update user subscription
        // Validate and create dates safely
        const now = new Date();
        const startDate = stripeSubscription.current_period_start
          ? new Date(stripeSubscription.current_period_start * 1000)
          : now;
        const endDate = stripeSubscription.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000)
          : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days from now
        const nextBillingDate = stripeSubscription.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000)
          : null;

        // Validate dates are valid
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error("Invalid date values from Stripe subscription", {
            current_period_start: stripeSubscription.current_period_start,
            current_period_end: stripeSubscription.current_period_end,
          });
          return new Response("Invalid subscription dates", { status: 400 });
        }

        const isUpgrade = session.metadata?.isUpgrade === "true";
        const oldSubscriptionId = session.metadata?.oldSubscriptionId;

        await prisma.$transaction(async (tx) => {
          // Get old subscription if this is an upgrade
          let oldSubscription = null;
          if (isUpgrade && oldSubscriptionId) {
            oldSubscription = await tx.userSubscription.findUnique({
              where: { id: oldSubscriptionId },
              include: { plan: true },
            });

            // Cancel old subscription in Stripe if it exists
            if (oldSubscription?.stripeSubscriptionId) {
              try {
                await stripe.subscriptions.cancel(oldSubscription.stripeSubscriptionId);
                console.log("Cancelled old Stripe subscription", {
                  oldSubscriptionId: oldSubscription.stripeSubscriptionId,
                });
              } catch (error) {
                console.error("Error cancelling old Stripe subscription:", error);
                // Continue even if cancellation fails
              }
            }
          }

          // Cancel any existing active subscriptions in database
          await tx.userSubscription.updateMany({
            where: {
              userId: userId,
              status: {
                in: ["Active", "Trial"],
              },
            },
            data: {
              status: "Cancelled",
              autoRenew: false,
              cancelledAt: new Date(),
            },
          });

          // Create new subscription
          const subscription = await tx.userSubscription.create({
            data: {
              userId: userId,
              planId: planId,
              status: plan.trialDays > 0 ? "Trial" : "Active",
              billingCycle: billingCycle === "yearly" ? "Yearly" : "Monthly",
              startDate: startDate,
              endDate: endDate,
              nextBillingDate: nextBillingDate,
              autoRenew: true,
              stripeSubscriptionId: stripeSubscriptionId,
              stripeCustomerId: customerId,
            },
          });

          // Log to history - use "Upgraded" for upgrades, "Created" for new subscriptions
          await tx.subscriptionHistory.create({
            data: {
              userId: userId,
              subscriptionId: subscription.id,
              action: isUpgrade ? "Upgraded" : "Created",
              oldPlanId: oldSubscription?.planId || null,
              newPlanId: planId,
            },
          });

          // Create invoice if payment was successful
          if (session.payment_status === "paid" && session.amount_total) {
            const invoiceNumber = `INV-${Date.now()}-${subscription.id.slice(0, 8)}`;
            await tx.invoice.create({
              data: {
                invoiceNumber: invoiceNumber,
                userId: userId,
                subscriptionId: subscription.id,
                planName: plan.name,
                amount: session.amount_total,
                totalAmount: session.amount_total,
                paymentStatus: "Paid",
                paymentDate: new Date(),
                stripePaymentIntentId: session.payment_intent as string | null,
                stripeInvoiceId: stripeSubscription.latest_invoice as string | null,
              },
            });
          }
        });

        console.log("Subscription created successfully", {
          userId,
          planId,
          stripeSubscriptionId,
        });
      } catch (error) {
        console.error("Error processing subscription checkout:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : String(error));
        console.error("Stripe subscription data:", {
          id: stripeSubscription?.id,
          current_period_start: stripeSubscription?.current_period_start,
          current_period_end: stripeSubscription?.current_period_end,
          status: stripeSubscription?.status,
        });
        return new Response("Internal server error", { status: 500 });
      }

      return new Response(null, { status: 200 });
    }

    // Existing course enrollment handler
    try {
      // Validate required metadata
      const courseId = session.metadata?.courseId;
      const enrollmentId = session.metadata?.enrollmentId;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;

      if (!courseId) {
        console.error("Course id not found in session metadata", {
          sessionId: session.id,
          metadata: session.metadata,
        });
        return new Response("Course id not found", { status: 400 });
      }

      if (!enrollmentId) {
        console.error("Enrollment id not found in session metadata", {
          sessionId: session.id,
          metadata: session.metadata,
        });
        return new Response("Enrollment id not found", { status: 400 });
      }

      if (!customerId) {
        console.error("Customer id not found in session", {
          sessionId: session.id,
        });
        return new Response("Customer id not found", { status: 400 });
      }

      // Find user by stripe customer ID
      const user = await prisma.user.findUnique({
        where: {
          stripeCustomerId: customerId,
        },
      });

      if (!user) {
        console.error("User not found for stripe customer", {
          customerId,
          sessionId: session.id,
        });
        return new Response("User not found", { status: 404 });
      }

      // Check if enrollment exists and belongs to the correct user and course
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          id: enrollmentId,
        },
      });

      if (!existingEnrollment) {
        console.error("Enrollment not found", {
          enrollmentId,
          sessionId: session.id,
        });
        return new Response("Enrollment not found", { status: 404 });
      }

      // Validate enrollment belongs to the correct user and course
      if (existingEnrollment.userId !== user.id) {
        console.error("Enrollment user mismatch", {
          enrollmentId,
          enrollmentUserId: existingEnrollment.userId,
          expectedUserId: user.id,
          sessionId: session.id,
        });
        return new Response("Enrollment user mismatch", { status: 400 });
      }

      if (existingEnrollment.courseId !== courseId) {
        console.error("Enrollment course mismatch", {
          enrollmentId,
          enrollmentCourseId: existingEnrollment.courseId,
          expectedCourseId: courseId,
          sessionId: session.id,
        });
        return new Response("Enrollment course mismatch", { status: 400 });
      }

      // If already active, return success (idempotency)
      if (existingEnrollment.status === "Active") {
        console.log("Enrollment already active", {
          enrollmentId: existingEnrollment.id,
          courseId: existingEnrollment.courseId,
          userId: existingEnrollment.userId,
        });
        return new Response(null, { status: 200 });
      }

      // Update enrollment status to Active
      const enrollment = await prisma.enrollment.update({
        where: {
          id: enrollmentId,
        },
        data: {
          status: "Active",
          amount: session.amount_total ? Math.round(session.amount_total) : undefined,
          updatedAt: new Date(),
        },
      });

      console.log("Enrollment updated successfully", {
        enrollmentId: enrollment.id,
        courseId: enrollment.courseId,
        userId: enrollment.userId,
        status: enrollment.status,
      });
    } catch (error) {
      console.error("Error processing checkout.session.completed:", error);
      // Return 500 so Stripe will retry
      return new Response("Internal server error", { status: 500 });
    }
  }

  // B) customer.subscription.created / customer.subscription.updated
  // Source of truth for status, periods, cancel_at_period_end, and plan mapping
  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const stripeSubscription = event.data.object as Stripe.Subscription;

    try {
      // Check for org-based subscription first
      const orgSubscription = await prisma.subscription.findUnique({
        where: {
          stripeSubscriptionId: stripeSubscription.id,
        },
      });

      if (orgSubscription) {
        // Map Stripe status to our status
        const statusMap: Record<
          string,
          "Active" | "Trialing" | "PastDue" | "Cancelled" | "Expired" | "Incomplete" | "Paused"
        > = {
          active: "Active",
          trialing: "Trialing",
          past_due: "PastDue",
          canceled: "Cancelled",
          unpaid: "Expired",
          incomplete: "Incomplete",
          incomplete_expired: "Expired",
          paused: "Paused",
        };

        const newStatus =
          statusMap[stripeSubscription.status] || "Incomplete";

        // Get price ID and map to plan code
        const priceId = stripeSubscription.items.data[0]?.price.id;
        const mappedPlanCode = priceId
          ? mapPriceIdToPlanCode(priceId) || orgSubscription.planCode
          : orgSubscription.planCode;

        const currentPeriodStart = stripeSubscription.current_period_start
          ? new Date(stripeSubscription.current_period_start * 1000)
          : null;
        const currentPeriodEnd = stripeSubscription.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000)
          : null;

        await prisma.subscription.update({
          where: { id: orgSubscription.id },
          data: {
            planCode: mappedPlanCode,
            status: newStatus,
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
            stripePriceId: priceId || orgSubscription.stripePriceId,
            updatedAt: new Date(),
          },
        });

        console.log("Org subscription updated", {
          orgId: orgSubscription.orgId,
          status: newStatus,
          planCode: mappedPlanCode,
        });
      } else {
        // Legacy user-based subscription handling
        const subscription = await prisma.userSubscription.findUnique({
          where: {
            stripeSubscriptionId: stripeSubscription.id,
          },
        });

        if (subscription) {
          const statusMap: Record<string, "Active" | "Cancelled" | "PastDue" | "Expired" | "Trial"> = {
            active: "Active",
            trialing: "Trial",
            canceled: "Cancelled",
            past_due: "PastDue",
            unpaid: "Expired",
          };

          const newStatus = statusMap[stripeSubscription.status] || "Active";
          
          // Safely create dates with validation
          let endDate: Date | null = null;
          let nextBillingDate: Date | null = null;
          
          if (stripeSubscription.current_period_end) {
            const date = new Date(stripeSubscription.current_period_end * 1000);
            if (!isNaN(date.getTime())) {
              endDate = date;
              nextBillingDate = date;
            }
          }

          await prisma.userSubscription.update({
            where: { id: subscription.id },
            data: {
              status: newStatus,
              ...(endDate && { endDate }),
              ...(nextBillingDate && { nextBillingDate }),
              autoRenew: !stripeSubscription.cancel_at_period_end,
              cancelledAt: stripeSubscription.cancel_at_period_end
                ? new Date()
                : subscription.cancelledAt,
            },
          });
        } else if (event.type === "customer.subscription.created") {
          // If subscription doesn't exist yet, try to create it from metadata
          // This can happen if checkout.session.completed failed or hasn't run yet
          const customerId = typeof stripeSubscription.customer === "string"
            ? stripeSubscription.customer
            : stripeSubscription.customer?.id;

          if (customerId) {
            const user = await prisma.user.findUnique({
              where: { stripeCustomerId: customerId },
            });

            if (user) {
              // Try to find plan from price ID
              const priceId = stripeSubscription.items.data[0]?.price.id;
              if (priceId) {
                const plan = await prisma.subscriptionPlan.findFirst({
                  where: {
                    OR: [
                      { stripePriceIdMonthly: priceId },
                      { stripePriceIdYearly: priceId },
                    ],
                  },
                });

                if (plan) {
                  // Validate and create dates safely
                  const now = new Date();
                  const startDate = stripeSubscription.current_period_start
                    ? new Date(stripeSubscription.current_period_start * 1000)
                    : now;
                  const endDate = stripeSubscription.current_period_end
                    ? new Date(stripeSubscription.current_period_end * 1000)
                    : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days from now
                  const nextBillingDate = stripeSubscription.current_period_end
                    ? new Date(stripeSubscription.current_period_end * 1000)
                    : null;
                  const billingCycle = plan.stripePriceIdMonthly === priceId ? "Monthly" : "Yearly";

                  // Validate dates are valid
                  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || (nextBillingDate && isNaN(nextBillingDate.getTime()))) {
                    console.error("Invalid date values from Stripe subscription", {
                      current_period_start: stripeSubscription.current_period_start,
                      current_period_end: stripeSubscription.current_period_end,
                    });
                    return new Response("Invalid subscription dates", { status: 400 });
                  }

                  await prisma.$transaction(async (tx) => {
                    // Cancel any existing active subscriptions
                    await tx.userSubscription.updateMany({
                      where: {
                        userId: user.id,
                        status: {
                          in: ["Active", "Trial"],
                        },
                      },
                      data: {
                        status: "Cancelled",
                        autoRenew: false,
                        cancelledAt: new Date(),
                      },
                    });

                    const newSubscription = await tx.userSubscription.create({
                      data: {
                        userId: user.id,
                        planId: plan.id,
                        status: stripeSubscription.status === "trialing" ? "Trial" : "Active",
                        billingCycle: billingCycle,
                        startDate: startDate,
                        endDate: endDate,
                        nextBillingDate: nextBillingDate,
                        autoRenew: true,
                        stripeSubscriptionId: stripeSubscription.id,
                        stripeCustomerId: customerId,
                      },
                    });

                    await tx.subscriptionHistory.create({
                      data: {
                        userId: user.id,
                        subscriptionId: newSubscription.id,
                        action: "Created",
                        newPlanId: plan.id,
                      },
                    });
                  });

                  console.log("Subscription created from customer.subscription.created event", {
                    userId: user.id,
                    planId: plan.id,
                    stripeSubscriptionId: stripeSubscription.id,
                  });
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error processing subscription.created/updated:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      console.error("Error stack:", error instanceof Error ? error.stack : undefined);
      console.error("Stripe subscription data:", {
        id: stripeSubscription?.id,
        current_period_start: stripeSubscription?.current_period_start,
        current_period_end: stripeSubscription?.current_period_end,
        status: stripeSubscription?.status,
      });
      return new Response("Internal server error", { status: 500 });
    }

    return new Response(null, { status: 200 });
  }

  // C) customer.subscription.deleted - Mark subscription canceled/expired
  if (event.type === "customer.subscription.deleted") {
    const stripeSubscription = event.data.object as Stripe.Subscription;

    try {
      // Check for org-based subscription first
      const orgSubscription = await prisma.subscription.findUnique({
        where: {
          stripeSubscriptionId: stripeSubscription.id,
        },
      });

      if (orgSubscription) {
        await prisma.subscription.update({
          where: { id: orgSubscription.id },
          data: {
            status: "Expired",
            cancelAtPeriodEnd: false,
            updatedAt: new Date(),
          },
        });

        console.log("Org subscription deleted", {
          orgId: orgSubscription.orgId,
        });
      } else {
        // Legacy user-based subscription handling
        const subscription = await prisma.userSubscription.findUnique({
          where: {
            stripeSubscriptionId: stripeSubscription.id,
          },
        });

        if (subscription) {
          await prisma.$transaction(async (tx) => {
            await tx.userSubscription.update({
              where: { id: subscription.id },
              data: {
                status: "Expired",
                autoRenew: false,
                cancelledAt: new Date(),
              },
            });

            await tx.subscriptionHistory.create({
              data: {
                userId: subscription.userId,
                subscriptionId: subscription.id,
                action: "Expired",
                oldPlanId: subscription.planId,
              },
            });
          });
        }
      }
    } catch (error) {
      console.error("Error processing subscription.deleted:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }

  // D) invoice.payment_succeeded - Set status active, confirm renewals
  if (event.type === "invoice.payment_succeeded" || event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;

    try {
      if (invoice.subscription) {
        const stripeSubscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription.id;

        // Check for org-based subscription first
        const orgSubscription = await prisma.subscription.findUnique({
          where: {
            stripeSubscriptionId: stripeSubscriptionId,
          },
        });

        if (orgSubscription && invoice.period_end) {
          const currentPeriodEnd = new Date(invoice.period_end * 1000);

          await prisma.subscription.update({
            where: { id: orgSubscription.id },
            data: {
              status: "Active",
              currentPeriodEnd,
              updatedAt: new Date(),
            },
          });

          console.log("Org subscription payment succeeded", {
            orgId: orgSubscription.orgId,
          });
        } else {
          // Legacy user-based subscription handling
          const subscription = await prisma.userSubscription.findUnique({
            where: {
              stripeSubscriptionId: stripeSubscriptionId,
            },
            include: {
              plan: true,
            },
          });

          if (subscription && invoice.amount_paid) {
            // Update subscription dates with validation
            let endDate: Date | null = null;
            let nextBillingDate: Date | null = null;
            
            if (invoice.period_end) {
              const date = new Date(invoice.period_end * 1000);
              if (!isNaN(date.getTime())) {
                endDate = date;
                nextBillingDate = date;
              }
            }

            await prisma.$transaction(async (tx) => {
              await tx.userSubscription.update({
                where: { id: subscription.id },
                data: {
                  status: "Active",
                  ...(endDate && { endDate }),
                  ...(nextBillingDate && { nextBillingDate }),
                },
              });

              // Check if invoice already exists to avoid duplicates
              const existingInvoice = await tx.invoice.findUnique({
                where: {
                  stripeInvoiceId: invoice.id,
                },
              });

              if (!existingInvoice) {
                // Create invoice
                const invoiceNumber = `INV-${Date.now()}-${subscription.id.slice(0, 8)}`;
                await tx.invoice.create({
                  data: {
                    invoiceNumber: invoiceNumber,
                    userId: subscription.userId,
                    subscriptionId: subscription.id,
                    planName: subscription.plan?.name || "Subscription",
                    amount: invoice.amount_paid,
                    totalAmount: invoice.amount_paid,
                    paymentStatus: "Paid",
                    paymentDate: new Date(),
                    stripePaymentIntentId: invoice.payment_intent as string | null,
                    stripeInvoiceId: invoice.id,
                  },
                });
              }

              // Only create history if this is a renewal (not initial payment)
              const existingHistory = await tx.subscriptionHistory.findFirst({
                where: {
                  subscriptionId: subscription.id,
                  action: "Renewed",
                  createdAt: {
                    gte: new Date(Date.now() - 60000), // Within last minute
                  },
                },
              });

              if (!existingHistory) {
                await tx.subscriptionHistory.create({
                  data: {
                    userId: subscription.userId,
                    subscriptionId: subscription.id,
                    action: "Renewed",
                    oldPlanId: subscription.planId,
                  },
                });
              }
            });
          } else if (!subscription) {
            // Subscription doesn't exist yet - log but don't fail
            console.warn("Invoice payment succeeded but subscription not found", {
              stripeSubscriptionId: stripeSubscriptionId,
              invoiceId: invoice.id,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error processing invoice.payment_succeeded:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }

  // E) invoice.payment_failed - Set status past_due, grace period logic
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;

    try {
      if (invoice.subscription) {
        const stripeSubscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription.id;

        // Check for org-based subscription first
        const orgSubscription = await prisma.subscription.findUnique({
          where: {
            stripeSubscriptionId: stripeSubscriptionId,
          },
        });

        if (orgSubscription) {
          await prisma.subscription.update({
            where: { id: orgSubscription.id },
            data: {
              status: "PastDue",
              updatedAt: new Date(),
            },
          });

          console.log("Org subscription payment failed", {
            orgId: orgSubscription.orgId,
          });
        } else {
          // Legacy user-based subscription handling
          const subscription = await prisma.userSubscription.findUnique({
            where: {
              stripeSubscriptionId: stripeSubscriptionId,
            },
          });

          if (subscription) {
            await prisma.userSubscription.update({
              where: { id: subscription.id },
              data: {
                status: "PastDue",
              },
            });

            // Create failed invoice record
            if (invoice.amount_due) {
              const invoiceNumber = `INV-${Date.now()}-${subscription.id.slice(0, 8)}`;
              await prisma.invoice.create({
                data: {
                  invoiceNumber: invoiceNumber,
                  userId: subscription.userId,
                  subscriptionId: subscription.id,
                  planName: "Subscription Renewal",
                  amount: invoice.amount_due,
                  totalAmount: invoice.amount_due,
                  paymentStatus: "Failed",
                  stripeInvoiceId: invoice.id,
                },
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Error processing invoice.payment_failed:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }

  return new Response(null, { status: 200 });
}
