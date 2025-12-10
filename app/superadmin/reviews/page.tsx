"use server";

import { ReviewsList } from "./_components/ReviewsList";

const sampleNames = [
  "Webbee Update Emrun",
  "Maya Russell",
  "Abdul Karim",
  "Samantha Leigh",
  "Jason Park",
  "Natalie Flores",
  "Chris Hemsworth",
  "Lauren Patel",
  "Diego Alvarez",
  "Priya Shah",
];

const sampleTimes = [
  "3 years ago",
  "2 years ago",
  "8 months ago",
  "5 months ago",
  "1 year ago",
  "2 weeks ago",
  "4 months ago",
  "6 days ago",
];

const sampleRatings = [4, 5, 5, 4, 5, 4, 5, 5];

const sampleQuotes = [
  "This is the second Photoshop course I have completed with Cristian. Worth every penny and recommend it highly. The sound and video quality is of a good standard.",
  "Loved the hands-on approach! The instructor breaks complex topics into manageable lessons. This course boosted my confidence to start freelancing.",
  "Solid intermediate course. I appreciated the project-based sections. I'd love to see more advanced modules in future updates.",
  "Fantastic pacing and clear explanations. The capstone project helped me land my first client.",
  "Good coverage of the fundamentals with helpful cheat sheets. I'd love additional sections on automation/testing in the next release.",
  "Exactly what I needed to refresh my design skills. The downloadable resources are a bonus.",
  "Clear, concise, and full of practical tips. The additional office hours were a pleasant surprise!",
  "I've taken dozens of courses, and this one balances theory and practice better than most.",
];

const demoReviews = Array.from({ length: 15 }).map((_, index) => ({
  id: `${index + 1}`,
  name: sampleNames[index % sampleNames.length],
  avatar: `https://i.pravatar.cc/80?img=${(index + 10) % 70}`,
  timeAgo: sampleTimes[index % sampleTimes.length],
  rating: sampleRatings[index % sampleRatings.length],
  content: sampleQuotes[index % sampleQuotes.length],
}));

export default async function SuperAdminReviewsPage() {
  // requireSuperAdmin is already called in layout, no need to call again

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground">
          See what learners are saying about your recent courses.
        </p>
      </div>

      <ReviewsList reviews={demoReviews} />
    </div>
  );
}
