import "server-only";
import { requireUser } from "./require-user";

// Wishlist functionality has been removed from the schema
// This function returns an empty array to prevent errors
export async function getWishlist() {
  await requireUser();
  
  // Return empty array since wishlist model no longer exists
  return [];
}

export type WishlistItemType = Awaited<ReturnType<typeof getWishlist>>[0];



