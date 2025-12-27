import Hero from "./_components/Hero";
import WhyLearnSection from "./_components/WhyLearnSection";
import FeaturesSection from "./_components/FeaturesSection";
import TrendingCoursesSection from "./_components/TrendingCoursesSection";
import WhyChooseSection from "./_components/WhyChooseSection";
import EverythingInOnePlaceSection from "./_components/EverythingInOnePlaceSection";
import PricingSection from "./_components/PricingSection";
import FAQSection from "./_components/FAQSection";
import InfrastructureSection from "./_components/InfrastructureSection";
import { getAllCourses } from "@/app/data/course/get-all-courses";
import DemoPresentationImage from "./_components/DemoPresentationImage";

export default async function Home() {
  const courses = await getAllCourses();

  return (
    <>
      <Hero />

      <section className="pb-12 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DemoPresentationImage />
        </div>
      </section>

      <WhyLearnSection />

      <TrendingCoursesSection courses={courses} />

      <WhyChooseSection />

      <EverythingInOnePlaceSection />

      <FeaturesSection />

      <PricingSection />

      <InfrastructureSection />

      <FAQSection />
    </>
  );
}

