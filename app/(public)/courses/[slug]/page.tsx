import { getIndividualCourse } from "@/app/data/course/get-course";
import { getRelatedCourses } from "@/app/data/course/get-related-courses";
import { checkIfCourseBought } from "@/app/data/user/user-is-enrolled";
import { checkIfCourseInWishlist } from "@/app/data/user/user-is-in-wishlist";
import { CourseHero } from "@/components/course/CourseHero";
import { BuyCard } from "@/components/course/BuyCard";
import { LearningObjectives } from "@/components/course/LearningObjectives";
import { CourseIncludes } from "@/components/course/CourseIncludes";
import { CourseContentAccordion } from "@/components/course/CourseContentAccordion";
import { RequirementsList } from "@/components/course/RequirementsList";
import { ExpandableDescription } from "@/components/course/ExpandableDescription";
import { RelatedCoursesCarousel } from "@/components/course/RelatedCoursesCarousel";
import { CourseRatingSection } from "@/components/course/CourseRatingSection";
import { env } from "@/lib/env";
import { enrollInCourseAction } from "./actions";
import { CoursePageClient } from "./CoursePageClient";

type Params = Promise<{ slug: string }>;

// Format date for "Last updated"
const formatLastUpdated = (date: Date | null | undefined): string => {
  if (!date) {
    return "Recently";
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - dateObj.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} days ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }
};

// Generate learning objectives from course data
const generateLearningObjectives = (
  title: string,
  category: string,
  level: string,
  description: string
): string[] => {
  // Try to extract from description or generate based on course info
  const objectives: string[] = [];

  // Add category-specific objectives
  if (category.toLowerCase().includes("python")) {
    objectives.push("Master Python programming fundamentals");
    objectives.push("Build real-world Python applications");
    objectives.push("Understand object-oriented programming in Python");
  } else if (category.toLowerCase().includes("javascript")) {
    objectives.push("Learn modern JavaScript (ES6+)");
    objectives.push("Build interactive web applications");
    objectives.push("Understand asynchronous programming");
  } else {
    objectives.push("Master the core concepts and fundamentals");
    objectives.push("Build practical, real-world projects");
    objectives.push("Apply best practices and industry standards");
  }

  // Add level-specific objectives
  if (level === "Beginner") {
    objectives.push("Start from scratch with no prior experience needed");
    objectives.push("Learn step-by-step with hands-on exercises");
  } else if (level === "Intermediate") {
    objectives.push("Take your skills to the next level");
    objectives.push("Learn advanced techniques and patterns");
  } else {
    objectives.push("Master advanced concepts and techniques");
    objectives.push("Build complex, production-ready applications");
  }

  // Add generic objectives
  objectives.push("Get lifetime access to course materials");
  objectives.push("Receive a certificate of completion");

  return objectives.slice(0, 6); // Limit to 6 objectives
};

// Calculate price with discount
const calculatePrice = (originalPrice: number) => {
  // Apply 20% discount if course has good ratings or high enrollment
  const hasDiscount = originalPrice > 5000; // $50 threshold
  const discountPercentage = hasDiscount ? 20 : 0;
  const currentPrice = hasDiscount
    ? Math.round(originalPrice * (1 - discountPercentage / 100))
    : originalPrice;

  return {
    current: currentPrice,
    original: originalPrice,
    discountPercentage,
  };
};

// Determine badges
const getBadges = (
  enrollmentCount: number,
  averageRating: number,
  reviewCount: number,
  createdAt: Date
): string[] => {
  const badges: string[] = [];
  const isBestseller = enrollmentCount > 50;
  const isHotAndNew =
    new Date(createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000;
  const isPremium = averageRating >= 4.5 && reviewCount > 20;

  if (isBestseller) badges.push("Bestseller");
  if (isPremium) badges.push("Premium");
  if (isHotAndNew && !isBestseller) badges.push("Hot & New");

  return badges;
};

export default async function SlugPage({ params }: { params: Params }) {
  const { slug } = await params;
  const course = await getIndividualCourse(slug);
  const isEnrolled = await checkIfCourseBought(course.id);
  const isInWishlist = await checkIfCourseInWishlist(course.id);

  // Prepare data for components
  const instructorName = course.user.lastName
    ? `${course.user.firstName} ${course.user.lastName}`
    : course.user.firstName;

  const thumbnailUrl = `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.fly.storage.tigris.dev/${course.fileKey}`;

  const price = calculatePrice(course.price);
  const badges = getBadges(
    course.courseStats.enrolled,
    course.courseStats.averageRating,
    course.courseStats.reviewCount,
    course.updatedAt
  );

  const learningObjectives = generateLearningObjectives(
    course.title,
    course.category,
    course.level,
    course.description
  );

  // Format sections for accordion
  const sections = course.chapter.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    lessons: chapter.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
    })),
  }));

  // Get related courses
  const relatedCourses = await getRelatedCourses(
    course.id,
    course.category,
    4
  );

  // Default requirements
  const requirements = [
    "No prior knowledge required - we'll teach you everything",
    "Basic computer skills",
    "Internet connection",
    "Willingness to learn and practice",
  ];

  // Default includes
  const includes = [
    `${course.duration} hours on-demand video`,
    `${course.chapter.reduce((sum, ch) => sum + ch.lessons.length, 0)} downloadable resources`,
    "Full lifetime access",
    "Access on mobile and TV",
    "Certificate of completion",
  ];

  return (
    <div className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mb-8">
        <CourseHero
          title={course.title}
          subtitle={course.smallDescription}
          category={course.category}
          level={course.level}
          rating={course.courseStats.averageRating}
          totalRatings={course.courseStats.reviewCount}
          totalStudents={course.courseStats.enrolled}
          lastUpdated={formatLastUpdated(course.updatedAt)}
          badges={badges}
          instructor={{
            name: instructorName,
            title: course.user.designation || "Instructor",
            avatar: course.user.image,
            firstName: course.user.firstName,
            lastName: course.user.lastName,
          }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Course Content */}
        <div className="lg:col-span-2 space-y-0">
          <LearningObjectives objectives={learningObjectives} />
          <CourseIncludes includes={includes} />
          <CourseContentAccordion sections={sections} />
          <RequirementsList requirements={requirements} />
          <ExpandableDescription description={course.description} />
          <CourseRatingSection
            averageRating={course.courseStats.averageRating}
            totalRatings={course.courseStats.reviewCount}
            courseId={course.id}
            courseOwnerId={course.user.id}
          />
        </div>

        {/* Right Column - Buy Card (Sticky) */}
        <div className="lg:col-span-1">
          <CoursePageClient
            courseId={course.id}
            title={course.title}
            thumbnailUrl={thumbnailUrl}
            price={price}
            isEnrolled={isEnrolled}
            isInWishlist={isInWishlist}
            instructor={{
              name: instructorName,
              title: course.user.designation || "Instructor",
              avatar: course.user.image,
              firstName: course.user.firstName,
              lastName: course.user.lastName,
              stats: {
                students: course.instructorStats.students,
                courses: course.instructorStats.courses,
                reviews: course.instructorStats.reviews,
                averageRating: course.instructorStats.averageRating,
              },
              bio: course.user.bio,
            }}
          />
        </div>
      </div>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <RelatedCoursesCarousel courses={relatedCourses} />
      )}
    </div>
  );
}
