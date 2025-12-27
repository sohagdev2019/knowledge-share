import { CourseLimitCheckServer } from "@/components/teacher/CourseLimitCheck";
import { Suspense } from "react";
import { CourseCreationForm } from "./CourseCreationForm";

export default function CourseCreationPage() {
  return (
    <>
      {/* Course Limit Warning */}
      <Suspense fallback={null}>
        <CourseLimitCheckServer />
      </Suspense>

      <CourseCreationForm />
    </>
  );
}
