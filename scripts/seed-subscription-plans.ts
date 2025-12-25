import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding subscription plans...");

  // First, delete all plans that are not personal, team, or enterprise
  const validSlugs = ["personal", "team", "enterprise"];
  const allPlans = await prisma.subscriptionPlan.findMany({
    select: { id: true, slug: true, name: true },
  });

  const plansToDelete = allPlans.filter((plan) => !validSlugs.includes(plan.slug));
  
  if (plansToDelete.length > 0) {
    console.log(`\n🗑️  Deleting ${plansToDelete.length} old plan(s):`);
    for (const plan of plansToDelete) {
      console.log(`   - ${plan.name} (${plan.slug})`);
      await prisma.subscriptionPlan.delete({
        where: { id: plan.id },
      });
    }
    console.log("✅ Old plans deleted.\n");
  }

  // Create PERSONAL Plan (matches PLAN_ENTITLEMENTS.PERSONAL)
  const personalPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "personal" },
    update: {
      name: "Personal",
      description: "Perfect for individual learners",
      planType: "Personal",
      priceMonthly: 799, // $7.99 in cents
      priceYearly: 7990, // $79.90 in cents (save ~$16/year)
      isActive: true,
      isPopular: false,
      trialDays: 0,
      maxCourseAccess: 20, // From limits.max_courses
      allowsDownloads: true, // From features.downloads
      allowsCertificates: true, // From features.certificates
      allowsLiveClasses: false,
      allowsTeamAccess: false, // From features.team_roles
      teamSeats: 1,
      prioritySupport: false,
      allowsProgressTracking: true,
      allowsCommunitySupport: true,
      features: {
        list: [
          "Access to 20 courses",
          "Downloadable resources",
          "Downloadable certificates",
          "Basic progress tracking",
          "Community support",
          "Mobile app access",
        ],
      },
    },
    create: {
      name: "Personal",
      slug: "personal",
      description: "Perfect for individual learners",
      planType: "Personal",
      priceMonthly: 799, // $7.99 in cents
      priceYearly: 7990, // $79.90 in cents (save ~$16/year)
      isActive: true,
      isPopular: false,
      trialDays: 0,
      maxCourseAccess: 20, // From limits.max_courses
      allowsDownloads: true, // From features.downloads
      allowsCertificates: true, // From features.certificates
      allowsLiveClasses: false,
      allowsTeamAccess: false, // From features.team_roles
      teamSeats: 1,
      prioritySupport: false,
      allowsProgressTracking: true,
      allowsCommunitySupport: true,
      features: {
        list: [
          "Access to 20 courses",
          "Downloadable resources",
          "Downloadable certificates",
          "Basic progress tracking",
          "Community support",
          "Mobile app access",
        ],
      },
    },
  });

  console.log("✅ Created/Updated Personal plan:", personalPlan.name);

  // Create TEAM Plan (matches PLAN_ENTITLEMENTS.TEAM)
  const teamPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "team" },
    update: {
      name: "Team",
      description: "Perfect for small teams and growing businesses",
      planType: "Team",
      priceMonthly: 1999, // $19.99 in cents
      priceYearly: 19990, // $199.90 in cents (save ~$40/year)
      isActive: true,
      isPopular: true,
      trialDays: 7,
      maxCourseAccess: 200, // From limits.max_courses
      allowsDownloads: true, // From features.downloads
      allowsCertificates: true, // From features.certificates
      allowsLiveClasses: true,
      allowsTeamAccess: true, // From features.team_roles
      teamSeats: 10, // From limits.max_instructors
      prioritySupport: true,
      allowsProgressTracking: true,
      allowsCommunitySupport: true,
      features: {
        list: [
          "Access to 200 courses",
          "Downloadable resources",
          "Downloadable certificates",
          "Team access (up to 10 members)",
          "Team management",
          "API access",
          "Priority support",
          "Live Q&A sessions",
          "Basic progress tracking",
          "Community support",
          "Mobile app access",
        ],
      },
    },
    create: {
      name: "Team",
      slug: "team",
      description: "Perfect for small teams and growing businesses",
      planType: "Team",
      priceMonthly: 1999, // $19.99 in cents
      priceYearly: 19990, // $199.90 in cents (save ~$40/year)
      isActive: true,
      isPopular: true,
      trialDays: 7,
      maxCourseAccess: 200, // From limits.max_courses
      allowsDownloads: true, // From features.downloads
      allowsCertificates: true, // From features.certificates
      allowsLiveClasses: true,
      allowsTeamAccess: true, // From features.team_roles
      teamSeats: 10, // From limits.max_instructors
      prioritySupport: true,
      allowsProgressTracking: true,
      allowsCommunitySupport: true,
      features: {
        list: [
          "Access to 200 courses",
          "Downloadable resources",
          "Downloadable certificates",
          "Team access (up to 10 members)",
          "Team management",
          "API access",
          "Priority support",
          "Live Q&A sessions",
          "Basic progress tracking",
          "Community support",
          "Mobile app access",
        ],
      },
    },
  });

  console.log("✅ Created/Updated Team plan:", teamPlan.name);

  // Create ENTERPRISE Plan (matches PLAN_ENTITLEMENTS.ENTERPRISE)
  const enterprisePlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "enterprise" },
    update: {
      name: "Enterprise",
      description: "For large organizations with advanced needs. Request a demo for custom pricing.",
      planType: "Enterprise",
      priceMonthly: null, // Request for demo - no fixed price
      priceYearly: null,
      isActive: true,
      isPopular: false,
      trialDays: 14,
      maxCourseAccess: null, // Unlimited (999999 in limits)
      allowsDownloads: true, // From features.downloads
      allowsCertificates: true, // From features.certificates
      allowsLiveClasses: true,
      allowsTeamAccess: true, // From features.team_roles
      teamSeats: 9999, // From limits.max_instructors (unlimited)
      prioritySupport: true,
      allowsProgressTracking: true,
      allowsCommunitySupport: true,
      features: {
        list: [
          "Unlimited course access",
          "Downloadable resources",
          "Downloadable certificates",
          "Unlimited team members",
          "Team management",
          "SSO (Single Sign-On)",
          "API access",
          "Priority support",
          "Live Q&A sessions",
          "Advanced progress tracking",
          "Community support",
          "Mobile app access",
        ],
      },
    },
    create: {
      name: "Enterprise",
      slug: "enterprise",
      description: "For large organizations with advanced needs. Request a demo for custom pricing.",
      planType: "Enterprise",
      priceMonthly: null, // Request for demo - no fixed price
      priceYearly: null,
      isActive: true,
      isPopular: false,
      trialDays: 14,
      maxCourseAccess: null, // Unlimited (999999 in limits)
      allowsDownloads: true, // From features.downloads
      allowsCertificates: true, // From features.certificates
      allowsLiveClasses: true,
      allowsTeamAccess: true, // From features.team_roles
      teamSeats: 9999, // From limits.max_instructors (unlimited)
      prioritySupport: true,
      allowsProgressTracking: true,
      allowsCommunitySupport: true,
      features: {
        list: [
          "Unlimited course access",
          "Downloadable resources",
          "Downloadable certificates",
          "Unlimited team members",
          "Team management",
          "SSO (Single Sign-On)",
          "API access",
          "Priority support",
          "Live Q&A sessions",
          "Advanced progress tracking",
          "Community support",
          "Mobile app access",
        ],
      },
    },
  });

  console.log("✅ Created/Updated Enterprise plan:", enterprisePlan.name);

  console.log("\n🎉 All subscription plans seeded successfully!");
  console.log("\nPlans created:");
  console.log("  - Personal ($7.99/month)");
  console.log("  - Team ($19.99/month)");
  console.log("  - Enterprise (Request for demo)");
  console.log("\nNote: You'll need to create Stripe products and prices, then update:");
  console.log("  - stripePriceIdMonthly");
  console.log("  - stripePriceIdYearly");
  console.log("\nFor each plan in the database.");
}

main()
  .catch((e) => {
    console.error("Error seeding subscription plans:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

