import { getAllCreators } from "@/app/data/creator/get-all-creators";
import { CreatorHeroSection } from "./_components/CreatorHeroSection";
import { CreatorsGridSection } from "./_components/CreatorsGridSection";
import { CreatorCTASection } from "./_components/CreatorCTASection";

export default async function CreatorStoriesPage() {
  const creators = await getAllCreators();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
      <CreatorHeroSection />
      <CreatorsGridSection creators={creators} />
      <CreatorCTASection />
    </div>
  );
}
