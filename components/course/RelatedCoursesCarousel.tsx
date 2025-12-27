import { PublicCourseCard } from "@/app/(public)/_components/PublicCourseCard";
import { PublicCourseType } from "@/app/data/course/get-all-courses";
import { Card } from "@/components/ui/card";

interface RelatedCoursesCarouselProps {
  courses: PublicCourseType[];
  title?: string;
}

export function RelatedCoursesCarousel({
  courses,
  title = "Students also bought",
}: RelatedCoursesCarouselProps) {
  if (courses.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-8">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <PublicCourseCard key={course.id} data={course} />
        ))}
      </div>
    </section>
  );
}

