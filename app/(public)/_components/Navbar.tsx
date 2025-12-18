"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserDropdown } from "./UserDropdown";
import { getUserRole } from "./get-user-role";
import { useConstructUrl as constructFileUrl } from "@/hooks/use-construct-url";
import Logo from "@/public/logo.png";

const supportItems = [
  { name: "Contact Support", href: "#" },
  { name: "Hire an Expert", href: "#" },
];

const instructorItems = [
  { name: "Become an Instructor", href: "/become-an-instructor" },
  { name: "Instructors List", href: "/instructors" },
];

const studentItems = [{ name: "Students Gallery", href: "/students-gallery" }];

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

  return { open, handleEnter, handleLeave, toggle };
}

function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: { name: string; href: string }[];
}) {
  const { open, handleEnter, handleLeave, toggle } = useHoverMenu();

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/5"
      >
        {label}
        <ChevronDown 
          className={`h-3.5 w-3.5 transition-transform duration-300 ${
            open ? "rotate-180" : "rotate-0"
          }`} 
        />
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
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-200"
              style={{
                animationDelay: open ? `${index * 50}ms` : "0ms",
              }}
            >
              {item.name}
            </Link>
          ))}
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

  // Filter navigation items - removed Courses and Dashboard as they're in profile dropdown
  const visibleNavItems: Array<{ name: string; href: string; requireAuth?: boolean }> = [];

  return (
    <nav 
      className={`sticky top-4 z-50 flex justify-center px-4 transition-all duration-500 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div 
        className={`flex items-center justify-between w-full max-w-4xl bg-black rounded-full px-6 py-2.5 transition-all duration-500 ease-out ${
          isScrolled 
            ? "shadow-2xl shadow-black/50 scale-[0.98]" 
            : "shadow-lg shadow-black/30 scale-100"
        }`}
      >
        <Link 
          href="/" 
          className="flex items-center transition-transform duration-300 hover:scale-105"
        >
          <Image
            alt="Edupeak"
            loading="lazy"
            width={120}
            height={28}
            className="h-6 w-auto dark:invert transition-opacity duration-300"
            src={Logo}
            style={{ color: "transparent" }}
          />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-1">
          {visibleNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              {item.name}
            </Link>
          ))}

          <Link
            href="/blogs"
            className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            Blogs
          </Link>
          <Link
            href="/creator-stories"
            className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            Creator Stories
          </Link>
          {/* Hide Instructors and Get Support when logged in as admin */}
          {userRole !== "admin" && (
            <>
              <NavDropdown label="Instructors" items={instructorItems} />
              <NavDropdown label="Get Support" items={supportItems} />
            </>
          )}
          <NavDropdown label="Students" items={studentItems} />
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-2">
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
                className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/5"
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

        {/* Mobile menu button */}
        <button
          className="md:hidden p-1.5 text-muted-foreground hover:text-foreground transition-all duration-300 rounded-lg hover:bg-white/5 active:scale-95"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 transition-transform duration-300" />
        </button>
      </div>
    </nav>
  );
}
