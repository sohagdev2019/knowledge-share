import { StudentsHeroSection } from "./_components/StudentsHeroSection";
import { StudentsPageClient } from "./_components/StudentsPageClient";

export default async function StudentsGalleryPage() {
  return (
    <div className="min-h-screen bg-background">
      <StudentsHeroSection />
      <StudentsPageClient />
    </div>
  );
}

