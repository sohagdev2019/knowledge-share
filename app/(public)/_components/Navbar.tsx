"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { buttonVariants } from "@/components/ui/button";
import { UserDropdown } from "./UserDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  { name: "Courses", href: "/courses" },
  { name: "Dashboard", href: "/dashboard", requireAuth: true },
];

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

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  
  // Filter navigation items based on auth status
  const visibleNavItems = navigationItems.filter(
    (item) => !item.requireAuth || session
  );

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
            
            {/* Resources Dropdown */}
            <DropdownMenu open={resourcesOpen} onOpenChange={setResourcesOpen}>
              <div
                onMouseEnter={() => setResourcesOpen(true)}
                onMouseLeave={() => setResourcesOpen(false)}
              >
                <DropdownMenuTrigger className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 outline-none data-[state=open]:text-primary cursor-pointer">
                  Resources
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform duration-200 ${
                      resourcesOpen ? "rotate-180" : ""
                    }`} 
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  className="w-56 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseEnter={() => setResourcesOpen(true)}
                  onMouseLeave={() => setResourcesOpen(false)}
                >
                  {resourcesItems.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href} className="cursor-pointer transition-colors">
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </div>
            </DropdownMenu>

            {/* Get Support Dropdown */}
            <DropdownMenu open={supportOpen} onOpenChange={setSupportOpen}>
              <div
                onMouseEnter={() => setSupportOpen(true)}
                onMouseLeave={() => setSupportOpen(false)}
              >
                <DropdownMenuTrigger className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 outline-none data-[state=open]:text-primary cursor-pointer">
                  Get Support
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform duration-200 ${
                      supportOpen ? "rotate-180" : ""
                    }`} 
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  className="w-56 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseEnter={() => setSupportOpen(true)}
                  onMouseLeave={() => setSupportOpen(false)}
                >
                  {supportItems.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href} className="cursor-pointer transition-colors">
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </div>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-4 ml-6">
            {isPending ? null : session ? (
              <UserDropdown
                email={session.user.email}
                image={
                  session?.user.image ??
                  `https://avatar.vercel.sh/${session?.user.email}`
                }
                name={
                  session?.user.name && session.user.name.length > 0
                    ? session.user.name
                    : session?.user.email.split("@")[0]
                }
              />
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Login
                </Link>
                <Link href="/login" className={buttonVariants()}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
