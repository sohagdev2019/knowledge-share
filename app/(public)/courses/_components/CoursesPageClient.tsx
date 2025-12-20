"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PublicCourseType } from "@/app/data/course/get-all-courses";
import { PopularInstructorType } from "@/app/data/instructor/get-popular-instructors";
import {
  PublicCourseCard,
} from "../../_components/PublicCourseCard";
import { PopularInstructorsSlider } from "./PopularInstructorsSlider";
import { CourseSliderSection } from "./CourseSliderSection";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Grid3x3, ArrowUpDown, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { courseCategories } from "@/lib/zodSchemas";

const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;

interface CoursesPageClientProps {
  initialCourses: PublicCourseType[];
  instructors: PopularInstructorType[];
}

export function CoursesPageClient({ initialCourses, instructors }: CoursesPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isUpdatingUrlRef = useRef(false);
  
  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all"
  );
  const [selectedLevel, setSelectedLevel] = useState<string>(
    searchParams.get("level") || "all"
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sort") || "best-match"
  );
  const [viewMode, setViewMode] = useState<"grid" | "compact">(
    (searchParams.get("view") as "grid" | "compact") || "grid"
  );

  // Sync state with URL params when they change externally (browser back/forward)
  useEffect(() => {
    // Skip if we're updating the URL ourselves
    if (isUpdatingUrlRef.current) {
      isUpdatingUrlRef.current = false;
      return;
    }

    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "all";
    const urlLevel = searchParams.get("level") || "all";
    const urlSort = searchParams.get("sort") || "best-match";
    const urlView = (searchParams.get("view") as "grid" | "compact") || "grid";

    if (urlSearch !== searchQuery) setSearchQuery(urlSearch);
    if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
    if (urlLevel !== selectedLevel) setSelectedLevel(urlLevel);
    if (urlSort !== sortBy) setSortBy(urlSort);
    if (urlView !== viewMode) setViewMode(urlView);
  }, [searchParams, searchQuery, selectedCategory, selectedLevel, sortBy]);

  // Update URL when filters change (without page reload)
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }
    if (selectedLevel !== "all") {
      params.set("level", selectedLevel);
    }
    if (sortBy !== "best-match") {
      params.set("sort", sortBy);
    }
    if (viewMode !== "grid") {
      params.set("view", viewMode);
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `/courses?${queryString}` : "/courses";
    const currentSearch = window.location.search;
    const newSearch = queryString ? `?${queryString}` : "";
    
    // Only update URL if it's different from current (avoid infinite loops)
    if (currentSearch !== newSearch) {
      isUpdatingUrlRef.current = true;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchQuery, selectedCategory, selectedLevel, sortBy, viewMode, router]);

  // Get courses by category for featured sections
  const coursesByCategory = useMemo(() => {
    const categories = courseCategories.slice(0, 3); // Show top 3 categories
    return categories.map((category) => ({
      category,
      courses: initialCourses
        .filter((c) => c.category === category)
        .sort((a, b) => (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0))
        .slice(0, 4), // Top 4 courses per category
    }));
  }, [initialCourses]);

  // Filter and search courses
  const filteredCourses = useMemo(() => {
    let filtered = [...initialCourses];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.smallDescription?.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (course) => course.category === selectedCategory
      );
    }

    // Level filter
    if (selectedLevel !== "all") {
      filtered = filtered.filter((course) => course.level === selectedLevel);
    }

    // Apply sort
    switch (sortBy) {
      case "best-match":
        // Best match: prioritize by relevance (rating, enrollment, recency)
        filtered.sort((a, b) => {
          const aScore = (a.averageRating ?? 0) * 100 + (a.enrollmentCount ?? 0) * 10 + 
            (new Date(a.createdAt).getTime() / 1000000);
          const bScore = (b.averageRating ?? 0) * 100 + (b.enrollmentCount ?? 0) * 10 + 
            (new Date(b.createdAt).getTime() / 1000000);
          return bScore - aScore;
        });
        break;
      case "best-sellers":
        filtered.sort((a, b) => (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0));
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "best-rated":
        filtered.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
        break;
      case "trending":
        // Trending: recent courses with high enrollment
        filtered.sort((a, b) => {
          const daysSinceA = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          const daysSinceB = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          const aTrend = (a.enrollmentCount ?? 0) / Math.max(daysSinceA, 1) + (a.averageRating ?? 0) * 50;
          const bTrend = (b.enrollmentCount ?? 0) / Math.max(daysSinceB, 1) + (b.averageRating ?? 0) * 50;
          return bTrend - aTrend;
        });
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    return filtered;
  }, [initialCourses, searchQuery, selectedCategory, selectedLevel, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSortBy("best-match");
    router.replace("/courses", { scroll: false });
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedLevel !== "all" ||
    sortBy !== "best-match";

  return (
    <div className="mt-5 space-y-6 pt-8 md:pt-12">
      {/* Animated Slider Section with Tabs - At the top */}
      <CourseSliderSection courses={initialCourses} />

      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
          Explore Courses
        </h1>
        <p className="text-muted-foreground">
          Discover our wide range of courses designed to help you achieve your
          learning goals.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search courses by title, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-12"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {courseCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Level Filter */}
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {courseLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full sm:w-auto"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredCourses.length} course
            {filteredCourses.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>


      {/* Top Bar: Price Info, View Toggle, and Sort Options */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3 px-4 bg-muted/50 rounded-lg border border-border/50">
        {/* Left: Price Info */}
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          Price is in US dollars and excludes tax and handling fees
        </p>

        {/* Right: View Toggle and Sort Buttons */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* View Toggle */}
          <div className="flex items-center gap-1 border-r border-border pr-4">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "grid"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Grid view"
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("compact")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "compact"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Compact view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-1 flex-wrap">
            {[
              { value: "best-match", label: "Best match" },
              { value: "best-sellers", label: "Best sellers" },
              { value: "newest", label: "Newest" },
              { value: "best-rated", label: "Best rated" },
              { value: "trending", label: "Trending" },
              { value: "price-low", label: "Price", icon: ArrowUpDown },
            ].map((option) => {
              const isActive = sortBy === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-foreground text-background"
                      : "bg-background text-foreground hover:bg-muted border border-border"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {option.label}
                    {Icon && <Icon className="h-3 w-3" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Courses Grid/Compact */}
      {filteredCourses.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              : "grid grid-cols-1 gap-4"
          }
        >
          {filteredCourses.map((course) => (
            <PublicCourseCard 
              key={course.id} 
              data={course} 
              variant={viewMode === "compact" ? "compact" : "default"}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-foreground mb-2">
            No courses found
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your search or filters to find what you&apos;re looking for.
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          )}
        </div>
      )}

      {/* Featured Courses by Category - Only show when no active filters */}
      {!hasActiveFilters && coursesByCategory.map(({ category, courses }) => {
        if (courses.length === 0) return null;
        return (
          <section key={category} className="mt-12 mb-8">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Featured {category} Courses
              </h2>
              <p className="text-muted-foreground">
                Top {category} courses to get you started
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {courses.map((course) => (
                <PublicCourseCard 
                  key={course.id} 
                  data={course} 
                  variant="default"
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* Popular Instructors Slider */}
      <PopularInstructorsSlider instructors={instructors} />
    </div>
  );
}


