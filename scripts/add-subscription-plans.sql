-- Insert Free Plan
INSERT INTO subscription_plan (
  id, name, slug, description, 
  "priceMonthly", "priceYearly", 
  "isActive", "isPopular", "trialDays", 
  "maxCourseAccess", "allowsDownloads", 
  "allowsCertificates", "allowsLiveClasses", 
  "allowsTeamAccess", "teamSeats", 
  "prioritySupport", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Free',
  'free',
  'Perfect for getting started',
  0,
  0,
  true,
  false,
  0,
  5,
  false,
  true,
  false,
  false,
  1,
  false,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Insert Pro Plan (Most Popular)
INSERT INTO subscription_plan (
  id, name, slug, description, 
  "priceMonthly", "priceYearly", 
  "isActive", "isPopular", "trialDays", 
  "maxCourseAccess", "allowsDownloads", 
  "allowsCertificates", "allowsLiveClasses", 
  "allowsTeamAccess", "teamSeats", 
  "prioritySupport", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Pro',
  'pro',
  'For serious learners',
  2000,
  20000,
  true,
  true,
  7,
  NULL,
  true,
  true,
  true,
  false,
  1,
  true,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Insert Business Plan
INSERT INTO subscription_plan (
  id, name, slug, description, 
  "priceMonthly", "priceYearly", 
  "isActive", "isPopular", "trialDays", 
  "maxCourseAccess", "allowsDownloads", 
  "allowsCertificates", "allowsLiveClasses", 
  "allowsTeamAccess", "teamSeats", 
  "prioritySupport", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Business',
  'business',
  'For teams & organizations',
  10000,
  100000,
  true,
  false,
  14,
  NULL,
  true,
  true,
  true,
  true,
  50,
  true,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

