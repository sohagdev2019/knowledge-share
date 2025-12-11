import { requireUser } from "@/app/data/user/require-user";
import { WishlistGrid } from "./_components/WishlistGrid";
import { getWishlist } from "@/app/data/user/get-wishlist";
import { EmptyState } from "@/components/general/EmptyState";

export default async function WishlistPage() {
  await requireUser();
  const wishlistItems = await getWishlist();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Wishlist</h1>
        <p className="text-muted-foreground">
          Keep track of the courses you plan to enroll in soon.
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <EmptyState
          title="No courses in wishlist"
          description="You haven't added any courses to your wishlist yet. Start exploring courses and add them to your wishlist!"
          buttonText="Browse Courses"
          href="/courses"
        />
      ) : (
        <WishlistGrid items={wishlistItems} />
      )}
    </div>
  );
}

