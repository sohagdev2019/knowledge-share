"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserDropdown } from "./UserDropdown";
import { getUserRole } from "./get-user-role";
import { useConstructUrl as constructFileUrl } from "@/hooks/use-construct-url";
import { FloatingThemeToggle } from "@/components/ui/floating-theme-toggle";


const instructorItems = [
  { name: "Become an Instructor", href: "/become-an-instructor" },
  { name: "Instructors List", href: "/instructors" },
];


// Helper function to build course URL with query params
function buildCourseUrl(category?: string, search?: string): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (search) params.set("search", search);
  const queryString = params.toString();
  return queryString ? `/courses?${queryString}` : "/courses";
}

// Browse menu structure with nested submenus
// Maps to actual category names from the database
const browseMenuItems = [
  {
    name: "Web Development",
    href: buildCourseUrl("Development"),
    submenu: [
      { name: "JavaScript", href: buildCourseUrl("Development", "JavaScript") },
      { name: "React", href: buildCourseUrl("Development", "React") },
      { name: "Vue.js", href: buildCourseUrl("Development", "Vue") },
      { name: "Angular", href: buildCourseUrl("Development", "Angular") },
      { name: "Node.js", href: buildCourseUrl("Development", "Node.js") },
      { name: "Python", href: buildCourseUrl("Development", "Python") },
    ],
  },
  {
    name: "Design",
    href: buildCourseUrl("Design"),
    submenu: [
      { name: "Graphic Design", href: buildCourseUrl("Design", "Graphic Design") },
      { name: "Illustrator", href: buildCourseUrl("Design", "Illustrator") },
      { name: "UX/UI Design", href: buildCourseUrl("Design", "UX/UI Design") },
      { name: "Figma Design", href: buildCourseUrl("Design", "Figma") },
      { name: "Adobe XD", href: buildCourseUrl("Design", "Adobe XD") },
      { name: "Sketch", href: buildCourseUrl("Design", "Sketch") },
      { name: "Icon Design", href: buildCourseUrl("Design", "Icon Design") },
      { name: "Photoshop", href: buildCourseUrl("Design", "Photoshop") },
    ],
  },
  { name: "Mobile App", href: buildCourseUrl("Development", "Mobile") },
  { name: "IT Software", href: buildCourseUrl("IT & Software") },
  { name: "Marketing", href: buildCourseUrl("Marketing") },
  { name: "Music", href: buildCourseUrl("Music") },
  { name: "Lifestyle", href: buildCourseUrl("Health & Fitness") },
  { name: "Business", href: buildCourseUrl("Business") },
  { name: "Photography", href: buildCourseUrl("Photography") },
];

function useHoverMenu(delay = 120) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const toggle = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen((prev) => !prev);
  };

  return { open, handleEnter, handleLeave, toggle, setOpen };
}

function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: { name: string; href: string }[];
}) {
  const { open, handleEnter, handleLeave, toggle, setOpen } = useHoverMenu();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      // Use capture phase to catch clicks before they bubble
      document.addEventListener("mousedown", handleClickOutside, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [open, setOpen]);

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="group relative flex items-center gap-1 text-sm text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 overflow-hidden"
      >
        <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
          {label}
        </span>
        <ChevronDown 
          className={`h-3.5 w-3.5 relative z-10 transition-transform duration-300 ease-out ${
            open ? "rotate-180" : "rotate-0"
          }`} 
        />
        <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
      </button>
      <div
        className={`absolute left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 top-full mt-3 w-56 rounded-xl border border-border bg-background/95 shadow-xl backdrop-blur-md transition-all duration-300 ease-out ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto scale-100"
            : "opacity-0 -translate-y-2 pointer-events-none scale-95"
        }`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <div className="py-2">
          {items.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-300 ease-out rounded-md overflow-hidden ${
                open ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
              }`}
              style={{
                transitionDelay: open ? `${index * 30}ms` : "0ms",
              }}
            >
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                {item.name}
              </span>
              <span className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MultiLevelDropdown({
  label,
  items,
}: {
  label: string;
  items: Array<{
    name: string;
    href: string;
    submenu?: Array<{ name: string; href: string }>;
  }>;
}) {
  const { open, handleEnter, handleLeave, toggle, setOpen } = useHoverMenu();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const blankSpaceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
        setHoveredItem(null);
      }
    };

    if (open) {
      // Use capture phase to catch clicks before they bubble
      document.addEventListener("mousedown", handleClickOutside, true);
      
      return () => {
        document.removeEventListener("mousedown", handleClickOutside, true);
      };
    }
  }, [open, setOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blankSpaceTimeoutRef.current) {
        clearTimeout(blankSpaceTimeoutRef.current);
      }
    };
  }, []);


  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="group relative flex items-center gap-1 text-sm text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 overflow-hidden"
      >
        <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
          {label}
        </span>
        <ChevronDown 
          className={`h-3.5 w-3.5 relative z-10 transition-transform duration-300 ease-out ${
            open ? "rotate-180" : "rotate-0"
          }`} 
        />
        <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
      </button>
      <div
        className={`absolute left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 top-full mt-3 rounded-xl border border-border bg-background/95 shadow-xl backdrop-blur-md transition-all duration-300 ease-out ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto scale-100"
            : "opacity-0 -translate-y-2 pointer-events-none scale-95"
        }`}
        onMouseMove={(e) => {
          // Clear any pending close timeout
          if (blankSpaceTimeoutRef.current) {
            clearTimeout(blankSpaceTimeoutRef.current);
            blankSpaceTimeoutRef.current = null;
          }
          
          // Check if mouse is over an interactive element
          const target = e.target as HTMLElement;
          const isOverLink = target.closest('a[href]');
          const isOverButton = target.closest('button');
          // Check if over a menu item container (div with relative class containing a link)
          const menuItemContainer = target.closest('.relative');
          const isOverMenuItem = menuItemContainer && menuItemContainer.querySelector('a[href]');
          
          // If not over any interactive element, schedule close
          if (!isOverLink && !isOverButton && !isOverMenuItem) {
            blankSpaceTimeoutRef.current = setTimeout(() => {
              handleLeave();
              setHoveredItem(null);
            }, 200); // Small delay to allow movement between items
          }
        }}
        onMouseLeave={(e) => {
          // Clear timeout if leaving
          if (blankSpaceTimeoutRef.current) {
            clearTimeout(blankSpaceTimeoutRef.current);
            blankSpaceTimeoutRef.current = null;
          }
          
          // Close when leaving the dropdown container
          const relatedTarget = e.relatedTarget as HTMLElement;
          // Close if leaving to outside the dropdown or to the button
          const isLeavingToButton = relatedTarget?.closest('button[aria-expanded]') !== null;
          if (!dropdownRef.current?.contains(relatedTarget) && !isLeavingToButton) {
            handleLeave();
            setHoveredItem(null);
          }
        }}
      >
        <div className="flex">
          {/* Primary menu */}
          <div className="py-2 min-w-[200px]">
            {items.map((item, index) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => {
                  if (item.submenu) {
                    setHoveredItem(item.name);
                    handleEnter(); // Keep dropdown open
                  } else {
                    handleEnter(); // Keep dropdown open for items without submenu
                  }
                }}
                onMouseLeave={(e) => {
                  // Only clear hoveredItem if not moving to submenu or another menu item
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  const isMovingToSubmenu = submenuRef.current?.contains(relatedTarget);
                  const isMovingToMenuItem = relatedTarget?.closest('.relative') && 
                    relatedTarget?.closest('.relative') !== e.currentTarget;
                  
                  if (!isMovingToSubmenu && !isMovingToMenuItem) {
                    if (item.submenu) {
                      setHoveredItem(null);
                    }
                    // If leaving to blank space, close dropdown
                    if (!dropdownRef.current?.contains(relatedTarget)) {
                      handleLeave();
                    }
                  }
                }}
              >
                <Link
                  href={item.href}
                  className={`group relative flex items-center justify-between px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-300 ease-out rounded-md overflow-hidden ${
                    hoveredItem === item.name && item.submenu
                      ? "bg-muted/40 text-foreground"
                      : ""
                  } ${
                    open ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
                  }`}
                  style={{
                    transitionDelay: open ? `${index * 30}ms` : "0ms",
                  }}
                >
                  <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                    {item.name}
                  </span>
                  {item.submenu && (
                    <ChevronRight className={`h-3.5 w-3.5 ml-2 relative z-10 transition-transform duration-300 ${
                      hoveredItem === item.name ? "translate-x-1" : "translate-x-0"
                    }`} />
                  )}
                  <span className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
                </Link>
              </div>
            ))}
          </div>

          {/* Secondary menu (submenu) - Always render to prevent gaps */}
          <div 
            ref={submenuRef}
            className={`py-2 min-w-[200px] border-l border-border bg-background/98 rounded-r-xl transition-all duration-300 ease-out ${
              hoveredItem && items.find((item) => item.name === hoveredItem)?.submenu
                ? "opacity-100 translate-x-0 pointer-events-auto"
                : "opacity-0 -translate-x-2 pointer-events-none"
            }`}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            {hoveredItem && items.find((item) => item.name === hoveredItem)?.submenu && (
              <>
                {items
                  .find((item) => item.name === hoveredItem)
                  ?.submenu?.map((subItem, subIndex) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className={`group relative block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-300 ease-out rounded-md overflow-hidden ${
                        hoveredItem ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
                      }`}
                      style={{
                        transitionDelay: hoveredItem ? `${subIndex * 30}ms` : "0ms",
                      }}
                    >
                      <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                        {subItem.name}
                      </span>
                      <span className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
                    </Link>
                  ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const { data: session, status } = useSession();
  const isPending = status === "loading";
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null);
  const sessionFirstName =
    (session?.user as { firstName?: string } | undefined)?.firstName?.trim();

  // Fetch user role when session is available
  useEffect(() => {
    if (session) {
      getUserRole().then(setUserRole);
    } else {
      setUserRole(null);
    }
  }, [session]);

  // Scroll animation handler
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Add shadow/effect when scrolled
      setIsScrolled(currentScrollY > 20);
      
      // Hide/show navbar on scroll (optional - can be removed if not needed)
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Filter navigation items - removed Courses and Dashboard as they're in profile dropdown
  const visibleNavItems: Array<{ name: string; href: string; requireAuth?: boolean }> = [];

  return (
    <>
      <nav 
        className={`sticky top-4 z-50 flex justify-center px-4 transition-all duration-500 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
      <div 
        className={`flex items-center justify-between w-full max-w-4xl bg-white dark:bg-black border border-gray-200 dark:border-0 rounded-full px-6 py-2.5 transition-all duration-500 ease-out ${
          isScrolled 
            ? "shadow-2xl shadow-gray-200/50 dark:shadow-black/50 scale-[0.98]" 
            : "shadow-lg shadow-gray-200/30 dark:shadow-black/30 scale-100"
        }`}
      >
        <Link 
          href="/" 
          className="flex items-center transition-transform duration-300 hover:scale-105"
        >
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Edupeak
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/courses"
            className="group relative text-sm text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 overflow-hidden"
          >
            <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
              Courses
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </Link>
          
          <MultiLevelDropdown label="Browse" items={browseMenuItems} />
          
          <Link
            href="/about"
            className="group relative text-sm text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 overflow-hidden"
          >
            <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
              About
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </Link>
          
          <Link
            href="/pricing"
            className="group relative text-sm text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 overflow-hidden"
          >
            <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
              Pricing
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </Link>
          
          <Link
            href="/blogs"
            className="group relative text-sm text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 overflow-hidden"
          >
            <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
              Blogs
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </Link>
          
          <Link
            href="/career"
            className="group relative text-sm text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 overflow-hidden"
          >
            <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
              Career
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </Link>
          
          <Link
            href="/contact"
            className="group relative text-sm text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 overflow-hidden"
          >
            <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
              Contact
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </Link>
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme Toggle */}
          <FloatingThemeToggle />
          
          {isPending ? null : session?.user ? (
            <UserDropdown
              email={session.user.email || ""}
              image={
                session.user.image
                  ? session.user.image.startsWith("http")
                    ? session.user.image
                    : constructFileUrl(session.user.image)
                  : `https://avatar.vercel.sh/${session.user.email || ""}`
              }
              firstName={
                sessionFirstName && sessionFirstName.length > 0
                  ? sessionFirstName
                  : session.user.email?.split("@")[0] || ""
              }
              userRole={userRole}
            />
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
              >
                Login
              </Link>
              <Link href="/register">
                <button className="inline-flex items-center justify-center whitespace-nowrap tracking-tight transition-all duration-300 cursor-pointer disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-1 focus-visible:ring-ring/40 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 gap-1.5 h-8 px-5 rounded-full text-sm font-medium shadow-lg hover:shadow-xl shadow-primary/20">
                  Register
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button and theme toggle */}
        <div className="md:hidden flex items-center gap-2">
          {/* Theme Toggle for Mobile - Always visible */}
          <FloatingThemeToggle />
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-all duration-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 transition-transform duration-300" />
            ) : (
              <Menu className="h-5 w-5 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>
    </nav>

    {/* Mobile Menu */}
    <div
      className={`fixed inset-0 z-[60] md:hidden transition-all duration-500 ease-out ${
        isMobileMenuOpen
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Menu Content */}
        <div className="absolute top-0 left-0 right-0 bg-white dark:bg-black border-b border-gray-200 dark:border-border shadow-2xl overflow-y-auto max-h-screen overflow-x-visible">
          <div className="px-4 py-6 space-y-2">
            {/* Mobile menu items - organized in logical order */}
            <Link
              href="/courses"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`group relative block px-4 py-3 text-base text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all duration-300 overflow-hidden ${
                isMobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
              }`}
              style={{ transitionDelay: "50ms" }}
            >
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                Courses
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </Link>
            
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`group relative block px-4 py-3 text-base text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all duration-300 overflow-hidden ${
                isMobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                About
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </Link>
            
            <Link
              href="/pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`group relative block px-4 py-3 text-base text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all duration-300 overflow-hidden ${
                isMobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
              }`}
              style={{ transitionDelay: "150ms" }}
            >
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                Pricing
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </Link>

            <Link
              href="/blogs"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`group relative block px-4 py-3 text-base text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all duration-300 overflow-hidden ${
                isMobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                Blogs
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </Link>
            
            <Link
              href="/career"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`group relative block px-4 py-3 text-base text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all duration-300 overflow-hidden ${
                isMobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
              }`}
              style={{ transitionDelay: "250ms" }}
            >
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                Career
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`group relative block px-4 py-3 text-base text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all duration-300 overflow-hidden ${
                isMobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                Contact
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </Link>

            {/* Mobile auth buttons */}
            <div className="pt-4 border-t border-gray-200 dark:border-border mt-4 space-y-2 relative z-[70]">
              {isPending ? null : session?.user ? (
                <div className="px-4 relative z-[70]">
                  <div className="relative z-[70]">
                    <UserDropdown
                      email={session.user.email || ""}
                      image={
                        session.user.image
                          ? session.user.image.startsWith("http")
                            ? session.user.image
                            : constructFileUrl(session.user.image)
                          : `https://avatar.vercel.sh/${session.user.email || ""}`
                      }
                      firstName={
                        sessionFirstName && sessionFirstName.length > 0
                          ? sessionFirstName
                          : session.user.email?.split("@")[0] || ""
                      }
                      userRole={userRole}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base text-center text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base text-center bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all duration-200 font-medium"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
