"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserDropdown } from "./UserDropdown";
import { getUserRole } from "./get-user-role";
import { useConstructUrl as constructFileUrl } from "@/hooks/use-construct-url";
import Logo from "@/public/logo.png";


const instructorItems = [
  { name: "Become an Instructor", href: "/become-an-instructor" },
  { name: "Instructors List", href: "/instructors" },
];


// Browse menu structure with nested submenus
const browseMenuItems = [
  {
    name: "Web Development",
    href: "/browse/web-development",
    submenu: [
      { name: "JavaScript", href: "/browse/web-development/javascript" },
      { name: "React", href: "/browse/web-development/react" },
      { name: "Vue.js", href: "/browse/web-development/vue" },
      { name: "Angular", href: "/browse/web-development/angular" },
      { name: "Node.js", href: "/browse/web-development/nodejs" },
      { name: "Python", href: "/browse/web-development/python" },
    ],
  },
  {
    name: "Design",
    href: "/browse/design",
    submenu: [
      { name: "Graphic Design", href: "/browse/design/graphic-design" },
      { name: "Illustrator", href: "/browse/design/illustrator" },
      { name: "UX/UI Design", href: "/browse/design/ux-ui-design" },
      { name: "Figma Design", href: "/browse/design/figma-design" },
      { name: "Adobe XD", href: "/browse/design/adobe-xd" },
      { name: "Sketch", href: "/browse/design/sketch" },
      { name: "Icon Design", href: "/browse/design/icon-design" },
      { name: "Photoshop", href: "/browse/design/photoshop" },
    ],
  },
  { name: "Mobile App", href: "/browse/mobile-app" },
  { name: "IT Software", href: "/browse/it-software" },
  { name: "Marketing", href: "/browse/marketing" },
  { name: "Music", href: "/browse/music" },
  { name: "Lifestyle", href: "/browse/lifestyle" },
  { name: "Business", href: "/browse/business" },
  { name: "Photography", href: "/browse/photography" },
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
        className="group relative flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/5 overflow-hidden"
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
        className="group relative flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/5 overflow-hidden"
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
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <div className="flex">
          {/* Primary menu */}
          <div className="py-2 min-w-[200px]">
            {items.map((item, index) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.submenu && setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
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

          {/* Secondary menu (submenu) */}
          {hoveredItem && items.find((item) => item.name === hoveredItem)?.submenu && (
            <div className={`py-2 min-w-[200px] border-l border-border bg-background/98 rounded-r-xl transition-all duration-300 ease-out ${
              hoveredItem ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
            }`}>
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
            </div>
          )}
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
          <Link
            href="/courses"
            className="group relative text-sm text-muted-foreground hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/5 overflow-hidden"
          >
            <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
              Courses
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </Link>
          
          <MultiLevelDropdown label="Browse" items={browseMenuItems} />
          
          <Link
            href="/about"
            className="group relative text-sm text-muted-foreground hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/5 overflow-hidden"
          >
            <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
              About
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </Link>
          
          <Link
            href="/pricing"
            className="group relative text-sm text-muted-foreground hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/5 overflow-hidden"
          >
            <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
              Pricing
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </Link>
          
          <Link
            href="/blogs"
            className="group relative text-sm text-muted-foreground hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/5 overflow-hidden"
          >
            <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
              Blogs
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </Link>
          
          <Link
            href="/career"
            className="group relative text-sm text-muted-foreground hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/5 overflow-hidden"
          >
            <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
              Career
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </Link>
          
          <Link
            href="/contact"
            className="group relative text-sm text-muted-foreground hover:text-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/5 overflow-hidden"
          >
            <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
              Contact
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </Link>
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
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-1.5 text-muted-foreground hover:text-foreground transition-all duration-300 rounded-lg hover:bg-white/5 active:scale-95"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 transition-transform duration-300" />
          ) : (
            <Menu className="h-5 w-5 transition-transform duration-300" />
          )}
        </button>
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
        <div className="absolute top-0 left-0 right-0 bg-black border-b border-border shadow-2xl overflow-y-auto max-h-screen overflow-x-visible">
          <div className="px-4 py-6 space-y-2">
            {/* Mobile menu items - organized in logical order */}
            <Link
              href="/courses"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`group relative block px-4 py-3 text-base text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all duration-300 overflow-hidden ${
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
              className={`group relative block px-4 py-3 text-base text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all duration-300 overflow-hidden ${
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
              className={`group relative block px-4 py-3 text-base text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all duration-300 overflow-hidden ${
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
              className={`group relative block px-4 py-3 text-base text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all duration-300 overflow-hidden ${
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
              className={`group relative block px-4 py-3 text-base text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all duration-300 overflow-hidden ${
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
              className={`group relative block px-4 py-3 text-base text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all duration-300 overflow-hidden ${
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
            <div className="pt-4 border-t border-border mt-4 space-y-2 relative z-[70]">
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
                    className="block px-4 py-3 text-base text-center text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all duration-200"
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
