"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { UserDropdown } from "./UserDropdown";
import { getUserRole } from "./get-user-role";

const resourcesItems = [
  { name: "Creator Stories", href: "#" },
  { name: "Blog", href: "#" },
  { name: "Training Webinars", href: "#" },
  { name: "Free Guides & Downloads", href: "#" },
  { name: "The Creator's Playbook Podcast", href: "#" },
];

const supportItems = [
  { name: "Contact Support", href: "#" },
  { name: "FAQs", href: "#" },
  { name: "Help Center", href: "#" },
  { name: "Hire an Expert", href: "#" },
];

const instructorItems = [
  { name: "Become an Instructor", href: "/become-an-instructor" },
  { name: "Instructors List", href: "#" },
];

const studentItems = [{ name: "Students Gallery", href: "#" }];

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
        className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 cursor-pointer outline-none"
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`absolute left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 top-full mt-3 w-56 rounded-xl border border-border bg-background/95 shadow-xl backdrop-blur-md transition-all duration-200 ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <div className="py-2">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
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
  const { data: session, isPending } = authClient.useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
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

  // Determine dashboard href based on user role
  const dashboardHref = userRole === "admin" ? "/admin/courses" : "/dashboard";

  // Filter navigation items based on auth status and update Dashboard href
  const visibleNavItems: Array<{ name: string; href: string; requireAuth?: boolean }> = [
    { name: "Courses", href: "/courses" },
    ...(session
      ? [{ name: "Dashboard", href: dashboardHref, requireAuth: true }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-[backdrop-filter]:bg-background/60">
      <div className="container flex min-h-16 items-center mx-auto px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center mr-4 cursor-pointer">
          <span className="font-bold">KnowledgeShare.</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-end">
          <div className="flex items-center space-x-6">
            {visibleNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary cursor-pointer"
              >
                {item.name}
              </Link>
            ))}
            
            <NavDropdown label="Resources" items={resourcesItems} />
            <NavDropdown label="Instructors" items={instructorItems} />
            <NavDropdown label="Students" items={studentItems} />
            <NavDropdown label="Get Support" items={supportItems} />
          </div>

          <div className="flex items-center space-x-4 ml-6">
            {isPending ? null : session ? (
              <UserDropdown
                email={session.user.email}
                image={
                  session?.user.image ??
                  `https://avatar.vercel.sh/${session?.user.email}`
                }
                firstName={
                  sessionFirstName && sessionFirstName.length > 0
                    ? sessionFirstName
                    : session?.user.email.split("@")[0]
                }
                userRole={userRole}
              />
            ) : (
              <>
                <Link
                  href="/login"
                  className="group relative rounded-md px-4 py-1.5 font-semibold text-sm text-white border border-white/80 bg-[#1A2B40] hover:text-primary hover:border-primary transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
                >
                  {/* Hover glow effect */}
                  <span className="absolute inset-0 rounded-md bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 transition-colors duration-300">Sign in</span>
                </Link>
                <Link
                  href="/register"
                  className="group relative rounded-md px-4 py-1.5 font-semibold text-sm text-white bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
                >
                  {/* Hover glow effect */}
                  <span className="absolute inset-0 rounded-md bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Shine effect on hover */}
                  <span className="absolute inset-0 rounded-md bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative z-10">Join</span>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
