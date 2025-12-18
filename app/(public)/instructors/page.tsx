import { InstructorsHeroSection } from "./_components/InstructorsHeroSection";
import { InstructorsPageClient } from "./_components/InstructorsPageClient";

export default async function InstructorsPage() {
  return (
    <div className="min-h-screen bg-background">
      <InstructorsHeroSection />
      <InstructorsPageClient />
    </div>
  );
}
