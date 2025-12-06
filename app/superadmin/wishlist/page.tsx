import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { WishlistGrid } from "./_components/WishlistGrid";
import coverImage from "@/public/assets/images/image.png";

const demoWishlist = [
  {
    id: "1",
    title: "Complete HTML, CSS and Javascript Course",
    instructor: "Instructordemo2",
    category: "Bootstrap",
    rating: 0,
    reviews: 0,
    price: "Free",
    image: coverImage,
  },
  {
    id: "2",
    title: "Advanced React with Redux Course",
    instructor: "Instructordemo2",
    category: "React",
    rating: 4,
    reviews: 1,
    price: "$10",
    image: coverImage,
  },
  {
    id: "3",
    title: "Angular with Node.js Fullstack Development",
    instructor: "Instructordemo2",
    category: "Angular",
    rating: 4,
    reviews: 1,
    price: "Free",
    image: coverImage,
  },
  {
    id: "4",
    title: "REST APIs with Flask and Python Developer Course",
    instructor: "Instructordemo2",
    category: "Docker",
    rating: 4,
    reviews: 1,
    price: "$12",
    image: coverImage,
  },
  {
    id: "5",
    title: "iOS & Swift Complete Application Development Course",
    instructor: "Instructordemo2",
    category: "Angular",
    rating: 4,
    reviews: 1,
    price: "Free",
    image: coverImage,
  },
  {
    id: "6",
    title: "Advanced Android 12 & Kotlin Development Course",
    instructor: "Instructordemo2",
    category: "Gatsby",
    rating: 5,
    reviews: 1,
    price: "$15",
    image: coverImage,
  },
] as const;

export default async function SuperAdminWishlistPage() {
  await requireSuperAdmin();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Wishlist</h1>
        <p className="text-muted-foreground">
          Keep track of the courses you plan to enroll in soon.
        </p>
      </div>

      <WishlistGrid items={demoWishlist} />
    </div>
  );
}
