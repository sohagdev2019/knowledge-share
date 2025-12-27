import { prisma } from "../lib/db";

async function main() {
  console.log("Seeding subscription plans...\n");
  
  // Check if Stripe Price IDs are set
  const personalPriceId = process.env.STRIPE_PRICE_PERSONAL_MONTHLY;
  const teamPriceId = process.env.STRIPE_PRICE_TEAM_MONTHLY;
  
  if (personalPriceId) {
    console.log("✅ Personal Plan Stripe Price ID found:", personalPriceId);
  } else {
    console.log("⚠️  Personal Plan Stripe Price ID not found in environment variables");
    console.log("   Set STRIPE_PRICE_PERSONAL_MONTHLY in .env.local");
  }
  
  if (teamPriceId) {
    console.log("✅ Team Plan Stripe Price ID found:", teamPriceId);
  } else {
    console.log("⚠️  Team Plan Stripe Price ID not found in environment variables");
    console.log("   Set STRIPE_PRICE_TEAM_MONTHLY in .env.local");
  }
  console.log();

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
      priceYearly: null, // No yearly plan
      stripePriceIdMonthly: process.env.STRIPE_PRICE_PERSONAL_MONTHLY || null, // Add your Stripe Price ID here (e.g., "price_xxxxx")
      stripePriceIdYearly: null,
      isActive: true,
      isPopular: false,
      trialDays: 7,
      maxCourseAccess: 3, // From limits.max_courses
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
          "Access to 3 courses",
          "Downloadable resources",
          "Downloadable certificates",
          "Basic progress tracking",
          "Community support",
        ],
      },
    },
    create: {
      name: "Personal",
      slug: "personal",
      description: "Perfect for individual learners",
      planType: "Personal",
      priceMonthly: 799, // $7.99 in cents
      priceYearly: null, // No yearly plan
      stripePriceIdMonthly: process.env.STRIPE_PRICE_PERSONAL_MONTHLY || null, // Add your Stripe Price ID here (e.g., "price_xxxxx")
      stripePriceIdYearly: null,
      isActive: true,
      isPopular: false,
      trialDays: 7,
      maxCourseAccess: 3, // From limits.max_courses
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
          "Access to 3 courses",
          "Downloadable resources",
          "Downloadable certificates",
          "Basic progress tracking",
          "Community support",
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
      priceYearly: null, // No yearly plan
      stripePriceIdMonthly: process.env.STRIPE_PRICE_TEAM_MONTHLY || null, // Add your Stripe Price ID here (e.g., "price_xxxxx")
      stripePriceIdYearly: null,
      isActive: true,
      isPopular: true,
      trialDays: 14,
      maxCourseAccess: 10, // From limits.max_courses
      allowsDownloads: true, // From features.downloads
      allowsCertificates: true, // From features.certificates
      allowsLiveClasses: true,
      allowsTeamAccess: true, // From features.team_roles
      teamSeats: 5, // From limits.max_team_members
      prioritySupport: true,
      allowsProgressTracking: true,
      allowsCommunitySupport: true,
      features: {
        list: [
          "Access to 10 courses",
          "Downloadable resources",
          "Downloadable certificates",
          "Team access (up to 5 members)",
          "Team management",
          "API access",
          "Priority support",
          "Live Q&A sessions",
          "Basic progress tracking",
          "Community support",
        ],
      },
    },
    create: {
      name: "Team",
      slug: "team",
      description: "Perfect for small teams and growing businesses",
      planType: "Team",
      priceMonthly: 1999, // $19.99 in cents
      priceYearly: null, // No yearly plan
      stripePriceIdMonthly: process.env.STRIPE_PRICE_TEAM_MONTHLY || null, // Add your Stripe Price ID here (e.g., "price_xxxxx")
      stripePriceIdYearly: null,
      isActive: true,
      isPopular: true,
      trialDays: 14,
      maxCourseAccess: 10, // From limits.max_courses
      allowsDownloads: true, // From features.downloads
      allowsCertificates: true, // From features.certificates
      allowsLiveClasses: true,
      allowsTeamAccess: true, // From features.team_roles
      teamSeats: 5, // From limits.max_team_members
      prioritySupport: true,
      allowsProgressTracking: true,
      allowsCommunitySupport: true,
      features: {
        list: [
          "Access to 10 courses",
          "Downloadable resources",
          "Downloadable certificates",
          "Team access (up to 5 members)",
          "Team management",
          "API access",
          "Priority support",
          "Live Q&A sessions",
          "Basic progress tracking",
          "Community support",
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
      stripePriceIdMonthly: null, // Enterprise uses custom pricing
      stripePriceIdYearly: null,
      isActive: true,
      isPopular: false,
      trialDays: 30,
      maxCourseAccess: null, // Unlimited (999999 in limits)
      allowsDownloads: true, // From features.downloads
      allowsCertificates: true, // From features.certificates
      allowsLiveClasses: true,
      allowsTeamAccess: true, // From features.team_roles
      teamSeats: 999999, // Unlimited team members (large number)
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
      stripePriceIdMonthly: null, // Enterprise uses custom pricing
      stripePriceIdYearly: null,
      isActive: true,
      isPopular: false,
      trialDays: 30,
      maxCourseAccess: null, // Unlimited (999999 in limits)
      allowsDownloads: true, // From features.downloads
      allowsCertificates: true, // From features.certificates
      allowsLiveClasses: true,
      allowsTeamAccess: true, // From features.team_roles
      teamSeats: 999999, // Unlimited team members (large number)
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
  console.log("\n📝 Stripe Price IDs Status:");
  if (personalPriceId) {
    console.log(`   ✅ Personal Plan: ${personalPriceId}`);
  } else {
    console.log("   ❌ Personal Plan: Not set (add to .env.local)");
  }
  
  if (teamPriceId) {
    console.log(`   ✅ Team Plan: ${teamPriceId}`);
  } else {
    console.log("   ❌ Team Plan: Not set (add to .env.local)");
  }
  
  console.log("\n💡 To add Stripe Price IDs, add these to your .env.local file:");
  console.log("   STRIPE_PRICE_PERSONAL_MONTHLY=price_1ShXre2MBz781G8pSJl0GON2");
  console.log("   STRIPE_PRICE_TEAM_MONTHLY=price_1ShXrD2MBz781G8pct7HNgH5");
  console.log("\n   Then run: npm run seed:plans");
}

main()
  .catch((e) => {
    console.error("Error seeding subscription plans:", e);
    process.exit(1);
  });

