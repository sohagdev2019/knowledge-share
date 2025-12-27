#!/usr/bin/env tsx
/**
 * Utility script to manage subscription plans
 * 
 * Usage:
 *   npx tsx scripts/manage-subscription-plans.ts export    # Export plans to JSON
 *   npx tsx scripts/manage-subscription-plans.ts show      # Show current plans
 *   npx tsx scripts/manage-subscription-plans.ts validate  # Validate plan structure
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

// Plan entitlements data (extracted to avoid server-only dependency)
// This should match lib/subscription-entitlements.ts
const PLAN_ENTITLEMENTS = {
  PERSONAL: {
    features: {
      certificates: true,
      downloads: true,
      team_roles: false,
      sso: false,
      api_access: false,
    },
    limits: {
      max_instructors: 1,
      max_students: 300,
      max_courses: 20,
      storage_gb: 50,
      emails_per_month: 5000,
    },
  },
  TEAM: {
    features: {
      certificates: true,
      downloads: true,
      team_roles: true,
      sso: false,
      api_access: true,
    },
    limits: {
      max_instructors: 10,
      max_students: 5000,
      max_courses: 200,
      storage_gb: 500,
      emails_per_month: 50000,
    },
  },
  ENTERPRISE: {
    features: {
      certificates: true,
      downloads: true,
      team_roles: true,
      sso: true,
      api_access: true,
    },
    limits: {
      max_instructors: 9999,
      max_students: 999999,
      max_courses: 999999,
      storage_gb: 9999,
      emails_per_month: 999999,
    },
  },
} as const;

const command = process.argv[2] || "show";

async function exportPlans() {
  const json = JSON.stringify(PLAN_ENTITLEMENTS, null, 2);
  const outputPath = join(process.cwd(), "subscription-plans-export.json");
  
  writeFileSync(outputPath, json, "utf-8");
  console.log("✅ Plans exported to:", outputPath);
  console.log("\nYou can edit this file and import it back.");
}

function showPlans() {
  console.log("\n📋 Current Subscription Plans:\n");
  
  Object.entries(PLAN_ENTITLEMENTS).forEach(([planCode, data]) => {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`Plan: ${planCode}`);
    console.log(`${"=".repeat(50)}`);
    
    console.log("\n✨ Features:");
    Object.entries(data.features).forEach(([feature, enabled]) => {
      console.log(`  ${enabled ? "✅" : "❌"} ${feature}`);
    });
    
    console.log("\n📊 Limits:");
    Object.entries(data.limits).forEach(([limit, value]) => {
      const displayValue = value >= 9999 ? "Unlimited" : value.toLocaleString();
      console.log(`  ${limit}: ${displayValue}`);
    });
  });
  
  console.log("\n");
}

function validatePlans() {
  console.log("\n🔍 Validating subscription plans...\n");
  
  let isValid = true;
  const requiredFeatures = ["certificates", "downloads", "team_roles", "sso", "api_access"];
  const requiredLimits = ["max_instructors", "max_students", "max_courses", "storage_gb", "emails_per_month"];
  
  Object.entries(PLAN_ENTITLEMENTS).forEach(([planCode, data]) => {
    console.log(`Checking ${planCode}...`);
    
    // Check features
    requiredFeatures.forEach(feature => {
      if (!(feature in data.features)) {
        console.error(`  ❌ Missing feature: ${feature}`);
        isValid = false;
      }
    });
    
    // Check limits
    requiredLimits.forEach(limit => {
      if (!(limit in data.limits)) {
        console.error(`  ❌ Missing limit: ${limit}`);
        isValid = false;
      }
    });
    
    // Check types
    Object.entries(data.features).forEach(([feature, value]) => {
      if (typeof value !== "boolean") {
        console.error(`  ❌ Feature ${feature} must be boolean, got ${typeof value}`);
        isValid = false;
      }
    });
    
    Object.entries(data.limits).forEach(([limit, value]) => {
      if (typeof value !== "number") {
        console.error(`  ❌ Limit ${limit} must be number, got ${typeof value}`);
        isValid = false;
      }
    });
    
    console.log(`  ✅ ${planCode} is valid`);
  });
  
  if (isValid) {
    console.log("\n✅ All plans are valid!");
  } else {
    console.log("\n❌ Some plans have validation errors. Please fix them.");
    process.exit(1);
  }
}

function importPlans() {
  const importPath = join(process.cwd(), "subscription-plans-import.json");
  
  if (!existsSync(importPath)) {
    console.error(`❌ File not found: ${importPath}`);
    console.log("\n💡 Create a file named 'subscription-plans-import.json' with your plan data.");
    process.exit(1);
  }
  
  try {
    const json = readFileSync(importPath, "utf-8");
    const plans = JSON.parse(json);
    
    console.log("\n📥 Imported plans:");
    Object.keys(plans).forEach(planCode => {
      console.log(`  ✅ ${planCode}`);
    });
    
    console.log("\n⚠️  Note: This script only validates the import.");
    console.log("   To actually use these plans, update lib/subscription-entitlements.ts");
    console.log("   with the imported data.\n");
    
    // Validate imported structure
    const requiredFeatures = ["certificates", "downloads", "team_roles", "sso", "api_access"];
    const requiredLimits = ["max_instructors", "max_students", "max_courses", "storage_gb", "emails_per_month"];
    
    Object.entries(plans).forEach(([planCode, data]: [string, unknown]) => {
      if (!data || typeof data !== "object") {
        console.error(`❌ ${planCode}: Invalid plan data`);
        process.exit(1);
      }
      
      const planData = data as { features?: Record<string, unknown>; limits?: Record<string, unknown> };
      
      if (!planData.features || !planData.limits) {
        console.error(`❌ ${planCode}: Missing features or limits`);
        process.exit(1);
      }
      
      // TypeScript narrowing: we know features and limits exist after the check above
      const features = planData.features;
      const limits = planData.limits;
      
      requiredFeatures.forEach(feature => {
        if (!(feature in features)) {
          console.error(`❌ ${planCode}: Missing feature ${feature}`);
          process.exit(1);
        }
      });
      
      requiredLimits.forEach(limit => {
        if (!(limit in limits)) {
          console.error(`❌ ${planCode}: Missing limit ${limit}`);
          process.exit(1);
        }
      });
    });
    
    console.log("✅ Imported plans are valid!\n");
  } catch (error) {
    console.error("❌ Error importing plans:", error);
    process.exit(1);
  }
}

// Main
switch (command) {
  case "export":
    exportPlans();
    break;
  case "show":
    showPlans();
    break;
  case "validate":
    validatePlans();
    break;
  case "import":
    importPlans();
    break;
  default:
    console.log(`
Usage: npx tsx scripts/manage-subscription-plans.ts <command>

Commands:
  export    - Export current plans to JSON file
  show      - Display all current plans
  validate  - Validate plan structure
  import    - Validate imported plans from JSON

Examples:
  npx tsx scripts/manage-subscription-plans.ts show
  npx tsx scripts/manage-subscription-plans.ts export
  npx tsx scripts/manage-subscription-plans.ts validate
    `);
}

