import Hero from "./_components/Hero";
import WhyLearnSection from "./_components/WhyLearnSection";
import FeaturesSection from "./_components/FeaturesSection";
import CTASection from "./_components/CTASection";
import TrendingCoursesSection from "./_components/TrendingCoursesSection";
import { getAllCourses } from "@/app/data/course/get-all-courses";
import Image from "next/image";

export default async function Home() {
  const courses = await getAllCourses();

  return (
    <>
      <Hero />

      <section className="pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Image
            alt="Unosend Dashboard"
            width={1200}
            height={800}
            className="w-full h-auto"
            src="/assets/images/heroimage.webp"
            priority
          />
        </div>
      </section>

      <WhyLearnSection />

      <TrendingCoursesSection courses={courses} />

      <FeaturesSection />

      <CTASection />
    </>
  );
}

