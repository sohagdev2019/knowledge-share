import "server-only";
import { requireUser } from "./require-user";
import { prisma } from "@/lib/db";

// Helper to ensure table exists (same as in API route)
async function ensureWishlistTableExists() {
  try {
    const tableCheck = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'wishlist'
      ) as exists;
    `;

    if (tableCheck[0]?.exists) {
      return true;
    }

    console.log("⚠️  Wishlist table not found. Creating it now...");
    
    // Execute each statement separately to avoid P2010 errors
    try {
      // Create table
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "wishlist" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "courseId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id")
        )
      `);

      // Create indexes separately
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "wishlist_userId_idx" ON "wishlist"("userId")
      `);

      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "wishlist_courseId_idx" ON "wishlist"("courseId")
      `);

      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "wishlist_userId_courseId_key" ON "wishlist"("userId", "courseId")
      `);

      // Add foreign keys if they don't exist
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'wishlist_userId_fkey'
          ) THEN
            ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'wishlist_courseId_fkey'
          ) THEN
            ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_courseId_fkey" 
            FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$;
      `);
    } catch (sqlError) {
      // Check if it's a "already exists" error (which is fine)
      const errorMsg = sqlError instanceof Error ? sqlError.message : String(sqlError);
      if (errorMsg.includes("already exists") || errorMsg.includes("duplicate")) {
        console.log("Note: Some database objects already exist, continuing...");
      } else {
        throw sqlError;
      }
    }

    console.log("✅ Wishlist table created successfully!");
    return true;
  } catch (error) {
    console.error("Failed to create wishlist table:", error);
    return false;
  }
}

export async function getWishlist() {
  const user = await requireUser();
  
  // Ensure table exists
  const tableExists = await ensureWishlistTableExists();
  if (!tableExists) {
    console.warn("Wishlist table could not be created, returning empty array");
    return [];
  }

  try {
    const wishlistItems = await prisma.wishlist.findMany({
    where: {
      userId: user.id,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          duration: true,
          level: true,
          category: true,
          smallDescription: true,
          fileKey: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              image: true,
              username: true,
            },
          },
          ratings: {
            select: {
              rating: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return wishlistItems.map((item) => {
    const averageRating =
      item.course.ratings.length > 0
        ? item.course.ratings.reduce((sum, r) => sum + r.rating, 0) /
          item.course.ratings.length
        : 0;
    const instructorName =
      item.course.user.firstName && item.course.user.lastName
        ? `${item.course.user.firstName} ${item.course.user.lastName}`
        : item.course.user.username || item.course.user.firstName || "Unknown";

    return {
      id: item.id,
      courseId: item.courseId,
      createdAt: item.createdAt,
      // Flattened structure for backward compatibility with WishlistGrid
      title: item.course.title,
      slug: item.course.slug,
      price: item.course.price,
      duration: item.course.duration,
      level: item.course.level,
      category: item.course.category,
      smallDescription: item.course.smallDescription,
      fileKey: item.course.fileKey,
      instructor: instructorName,
      rating: averageRating,
      reviews: item.course.ratings.length,
      // Also include nested structure for future use
      course: {
        id: item.course.id,
        title: item.course.title,
        slug: item.course.slug,
        price: item.course.price,
        duration: item.course.duration,
        level: item.course.level,
        category: item.course.category,
        smallDescription: item.course.smallDescription,
        fileKey: item.course.fileKey,
        instructor: {
          id: item.course.user.id,
          firstName: item.course.user.firstName,
          lastName: item.course.user.lastName,
          image: item.course.user.image,
          username: item.course.user.username,
        },
        averageRating,
        ratingCount: item.course.ratings.length,
      },
    };
  });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    // If table doesn't exist error, return empty array
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("does not exist") || errorMessage.includes("P2021")) {
      // Try to create table one more time
      const retryTableExists = await ensureWishlistTableExists();
      if (retryTableExists) {
        // Retry the query
        try {
          const retryItems = await prisma.wishlist.findMany({
            where: { userId: user.id },
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  price: true,
                  duration: true,
                  level: true,
                  category: true,
                  smallDescription: true,
                  fileKey: true,
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      image: true,
                      username: true,
                    },
                  },
                  ratings: {
                    select: {
                      rating: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          });

          return retryItems.map((item) => {
            const averageRating =
              item.course.ratings.length > 0
                ? item.course.ratings.reduce((sum, r) => sum + r.rating, 0) /
                  item.course.ratings.length
                : 0;
            const instructorName =
              item.course.user.firstName && item.course.user.lastName
                ? `${item.course.user.firstName} ${item.course.user.lastName}`
                : item.course.user.username || item.course.user.firstName || "Unknown";

            return {
              id: item.id,
              courseId: item.courseId,
              createdAt: item.createdAt,
              title: item.course.title,
              slug: item.course.slug,
              price: item.course.price,
              duration: item.course.duration,
              level: item.course.level,
              category: item.course.category,
              smallDescription: item.course.smallDescription,
              fileKey: item.course.fileKey,
              instructor: instructorName,
              rating: averageRating,
              reviews: item.course.ratings.length,
              course: {
                id: item.course.id,
                title: item.course.title,
                slug: item.course.slug,
                price: item.course.price,
                duration: item.course.duration,
                level: item.course.level,
                category: item.course.category,
                smallDescription: item.course.smallDescription,
                fileKey: item.course.fileKey,
                instructor: {
                  id: item.course.user.id,
                  firstName: item.course.user.firstName,
                  lastName: item.course.user.lastName,
                  image: item.course.user.image,
                  username: item.course.user.username,
                },
                averageRating,
                ratingCount: item.course.ratings.length,
              },
            };
          });
        } catch (retryError) {
          console.error("Error on retry:", retryError);
          return [];
        }
      }
      return [];
    }
    // For other errors, return empty array
    return [];
  }
}

export type WishlistItemType = Awaited<ReturnType<typeof getWishlist>>[0];



