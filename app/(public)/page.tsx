import Hero from "./_components/Hero";
import WhyLearnSection from "./_components/WhyLearnSection";
import FeaturesSection from "./_components/FeaturesSection";
import CTASection from "./_components/CTASection";
import TrendingCoursesSection from "./_components/TrendingCoursesSection";
import { getAllCourses } from "@/app/data/course/get-all-courses";

export default async function Home() {
  const courses = await getAllCourses();

  return (
    <>
      <Hero />

      <WhyLearnSection />

      <TrendingCoursesSection courses={courses} />

      <FeaturesSection />

      <CTASection />
    </>
  );
}

