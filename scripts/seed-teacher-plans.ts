import { prisma } from "../lib/db";

async function main() {
  console.log("Seeding Teacher (Admin) subscription plans...\n");
  
  // Check if Stripe Price IDs are set
  const starterPriceId = process.env.STRIPE_PRICE_TEACHER_STARTER_MONTHLY;
  const proPriceId = process.env.STRIPE_PRICE_TEACHER_PRO_MONTHLY;
  const elitePriceId = process.env.STRIPE_PRICE_TEACHER_ELITE_MONTHLY;
  
  if (starterPriceId) {
    console.log("✅ Starter Teacher Plan Stripe Price ID found:", starterPriceId);
  } else {
    console.log("⚠️  Starter Teacher Plan Stripe Price ID not found in environment variables");
    console.log("   Set STRIPE_PRICE_TEACHER_STARTER_MONTHLY in .env.local");
  }
  
  if (proPriceId) {
    console.log("✅ Pro Teacher Plan Stripe Price ID found:", proPriceId);
  } else {
    console.log("⚠️  Pro Teacher Plan Stripe Price ID not found in environment variables");
    console.log("   Set STRIPE_PRICE_TEACHER_PRO_MONTHLY in .env.local");
  }
  
  if (elitePriceId) {
    console.log("✅ Elite Teacher Plan Stripe Price ID found:", elitePriceId);
  } else {
    console.log("⚠️  Elite Teacher Plan Stripe Price ID not found in environment variables");
    console.log("   Set STRIPE_PRICE_TEACHER_ELITE_MONTHLY in .env.local");
  }
  console.log();

  // Create STARTER TEACHER Plan
  const starterTeacherPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "starter-teacher" },
    update: {
      name: "Starter Teacher",
      description: "Start teaching online with essential tools. Best for new teachers.",
      planType: "Teacher",
      priceMonthly: 2999, // $29.99 in cents
      priceYearly: null, // Can add yearly pricing later
      stripePriceIdMonthly: starterPriceId || null,
      stripePriceIdYearly: null,
      isActive: true,
      isPopular: false,
      trialDays: 7,
      maxCourseAccess: null, // Not applicable for teachers (this is for student course access)
      allowsDownloads: true,
      allowsCertificates: false, // Starter doesn't have certificates
      allowsLiveClasses: false,
      allowsTeamAccess: false,
      teamSeats: 1,
      allowsTeamManagement: false,
      prioritySupport: false,
      allowsProgressTracking: true, // Basic analytics
      allowsCommunitySupport: true,
      features: {
        list: [
          "Up to 3 courses",
          "Up to 50 students",
          "2 GB video/file storage",
          "Basic course analytics",
          "Email support",
          "Standard platform branding",
        ],
        // Teacher-specific limits stored in features
        teacherLimits: {
          maxCourses: 3,
          maxStudents: 50,
          storageGB: 2,
        },
        analytics: "basic",
        support: "email",
        branding: "platform",
      },
    },
    create: {
      name: "Starter Teacher",
      slug: "starter-teacher",
      description: "Start teaching online with essential tools. Best for new teachers.",
      planType: "Teacher",
      priceMonthly: 2999, // $29.99 in cents
      priceYearly: null,
      stripePriceIdMonthly: starterPriceId || null,
      stripePriceIdYearly: null,
      isActive: true,
      isPopular: false,
      trialDays: 7,
      maxCourseAccess: null,
      allowsDownloads: true,
      allowsCertificates: false,
      allowsLiveClasses: false,
      allowsTeamAccess: false,
      teamSeats: 1,
      allowsTeamManagement: false,
      prioritySupport: false,
      allowsProgressTracking: true,
      allowsCommunitySupport: true,
      features: {
        list: [
          "Up to 3 courses",
          "Up to 50 students",
          "2 GB video/file storage",
          "Basic course analytics",
          "Email support",
          "Standard platform branding",
        ],
        teacherLimits: {
          maxCourses: 3,
          maxStudents: 50,
          storageGB: 2,
        },
        analytics: "basic",
        support: "email",
        branding: "platform",
      },
    },
  });

  console.log("✅ Created/Updated Starter Teacher plan:", starterTeacherPlan.name);

  // Create PRO TEACHER Plan (Most Popular)
  const proTeacherPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "pro-teacher" },
    update: {
      name: "Pro Teacher",
      description: "Scale your teaching and grow faster. Best for growing educators.",
      planType: "Teacher",
      priceMonthly: 7999, // $79.99 in cents
      priceYearly: null, // Can add yearly pricing later
      stripePriceIdMonthly: proPriceId || null,
      stripePriceIdYearly: null,
      isActive: true,
      isPopular: true, // Most Popular
      trialDays: 14,
      maxCourseAccess: null,
      allowsDownloads: true,
      allowsCertificates: true, // Pro has certificates
      allowsLiveClasses: true,
      allowsTeamAccess: false,
      teamSeats: 1,
      allowsTeamManagement: false,
      prioritySupport: true, // Priority email support
      allowsProgressTracking: true, // Advanced analytics
      allowsCommunitySupport: true,
      features: {
        list: [
          "Up to 15 courses",
          "Up to 500 students",
          "20 GB video/file storage",
          "Advanced analytics",
          "Course completion certificates",
          "Priority email support",
        ],
        teacherLimits: {
          maxCourses: 15,
          maxStudents: 500,
          storageGB: 20,
        },
        analytics: "advanced",
        support: "priority_email",
        branding: "platform",
      },
    },
    create: {
      name: "Pro Teacher",
      slug: "pro-teacher",
      description: "Scale your teaching and grow faster. Best for growing educators.",
      planType: "Teacher",
      priceMonthly: 7999, // $79.99 in cents
      priceYearly: null,
      stripePriceIdMonthly: proPriceId || null,
      stripePriceIdYearly: null,
      isActive: true,
      isPopular: true, // Most Popular
      trialDays: 14,
      maxCourseAccess: null,
      allowsDownloads: true,
      allowsCertificates: true,
      allowsLiveClasses: true,
      allowsTeamAccess: false,
      teamSeats: 1,
      allowsTeamManagement: false,
      prioritySupport: true,
      allowsProgressTracking: true,
      allowsCommunitySupport: true,
      features: {
        list: [
          "Up to 15 courses",
          "Up to 500 students",
          "20 GB video/file storage",
          "Advanced analytics",
          "Course completion certificates",
          "Priority email support",
        ],
        teacherLimits: {
          maxCourses: 15,
          maxStudents: 500,
          storageGB: 20,
        },
        analytics: "advanced",
        support: "priority_email",
        branding: "platform",
      },
    },
  });

  console.log("✅ Created/Updated Pro Teacher plan:", proTeacherPlan.name);

  // Create ELITE TEACHER Plan
  const eliteTeacherPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "elite-teacher" },
    update: {
      name: "Elite Teacher",
      description: "Complete freedom to teach without limits. Best for institutions & professionals.",
      planType: "Teacher",
      priceMonthly: 19999, // $199.99 in cents
      priceYearly: null, // Can add yearly pricing later
      stripePriceIdMonthly: elitePriceId || null,
      stripePriceIdYearly: null,
      isActive: true,
      isPopular: false,
      trialDays: 30,
      maxCourseAccess: null,
      allowsDownloads: true,
      allowsCertificates: true,
      allowsLiveClasses: true,
      allowsTeamAccess: true, // Team access for multiple teachers
      teamSeats: 999999, // Unlimited team members (large number)
      allowsTeamManagement: true,
      prioritySupport: true, // Dedicated support
      allowsProgressTracking: true, // Full analytics
      allowsCommunitySupport: true,
      features: {
        list: [
          "Unlimited courses",
          "Unlimited students",
          "Unlimited storage",
          "Team access (multiple teachers)",
          "Custom branding",
          "Dedicated support",
          "Full analytics dashboard",
          "Course completion certificates",
        ],
        teacherLimits: {
          maxCourses: null, // Unlimited
          maxStudents: null, // Unlimited
          storageGB: null, // Unlimited
        },
        analytics: "full",
        support: "dedicated",
        branding: "custom",
      },
    },
    create: {
      name: "Elite Teacher",
      slug: "elite-teacher",
      description: "Complete freedom to teach without limits. Best for institutions & professionals.",
      planType: "Teacher",
      priceMonthly: 19999, // $199.99 in cents
      priceYearly: null,
      stripePriceIdMonthly: elitePriceId || null,
      stripePriceIdYearly: null,
      isActive: true,
      isPopular: false,
      trialDays: 30,
      maxCourseAccess: null,
      allowsDownloads: true,
      allowsCertificates: true,
      allowsLiveClasses: true,
      allowsTeamAccess: true,
      teamSeats: 999999, // Unlimited team members (large number)
      allowsTeamManagement: true,
      prioritySupport: true,
      allowsProgressTracking: true,
      allowsCommunitySupport: true,
      features: {
        list: [
          "Unlimited courses",
          "Unlimited students",
          "Unlimited storage",
          "Team access (multiple teachers)",
          "Custom branding",
          "Dedicated support",
          "Full analytics dashboard",
          "Course completion certificates",
        ],
        teacherLimits: {
          maxCourses: null, // Unlimited
          maxStudents: null, // Unlimited
          storageGB: null, // Unlimited
        },
        analytics: "full",
        support: "dedicated",
        branding: "custom",
      },
    },
  });

  console.log("✅ Created/Updated Elite Teacher plan:", eliteTeacherPlan.name);

  console.log("\n🎉 Teacher subscription plans seeded successfully!");
  console.log("\n📋 Summary:");
  console.log(`   ✅ Starter Teacher - $29.99/month (3 courses, 50 students, 2GB)`);
  console.log(`   ✅ Pro Teacher - $79.99/month (15 courses, 500 students, 20GB) ⭐ Most Popular`);
  console.log(`   ✅ Elite Teacher - $199.99/month (Unlimited everything)`);
  
  console.log("\n💡 Next steps:");
  console.log("   1. Create Stripe products and prices for each plan");
  console.log("   2. Add Stripe Price IDs to .env.local:");
  console.log("      STRIPE_PRICE_TEACHER_STARTER_MONTHLY=price_xxxxx");
  console.log("      STRIPE_PRICE_TEACHER_PRO_MONTHLY=price_xxxxx");
  console.log("      STRIPE_PRICE_TEACHER_ELITE_MONTHLY=price_xxxxx");
  console.log("   3. Run this script again to update plans with Stripe Price IDs");
}

main()
  .catch((e) => {
    console.error("Error seeding teacher subscription plans:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

