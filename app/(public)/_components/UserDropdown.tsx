"use client";

import {
  BookOpen,
  ChevronDownIcon,
  Home,
  LayoutDashboardIcon,
  LogOutIcon,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

import { useSignOut } from "@/hooks/use-singout";

interface iAppProps {
  firstName: string;
  email: string;
  image: string;
  userRole?: string | null;
}

export function UserDropdown({ email, firstName, image, userRole }: iAppProps) {
  const handleSignOut = useSignOut();
  const router = useRouter();
  const displayName = firstName || email.split("@")[0];
  const displayInitial = displayName.charAt(0).toUpperCase();

  // Define menu items based on user role
  const isAdmin = userRole === "admin";
  
  const menuItems = isAdmin
    ? [
        { icon: Home, label: "Home", href: "/" },
        { icon: BookOpen, label: "Courses", href: "/admin/courses" },
        { icon: LayoutDashboardIcon, label: "Dashboard", href: "/admin" },
      ]
    : [
        { icon: Home, label: "Home", href: "/" },
        { icon: BookOpen, label: "Courses", href: "/courses" },
        { icon: LayoutDashboardIcon, label: "Dashboard", href: "/dashboard" },
        { icon: UserRound, label: "Profile", href: "/dashboard/profile" },
        { icon: UserRound, label: "Settings", href: "/dashboard/settings" },
      ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar>
            <AvatarImage src={image} alt="Profile image" />
            <AvatarFallback>{displayInitial}</AvatarFallback>
          </Avatar>
          <ChevronDownIcon
            size={16}
            className="opacity-60"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-48 bg-background/95 backdrop-blur-md border-border/50 shadow-xl"
      >
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="text-foreground truncate text-sm font-medium">
            {displayName}
          </span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuGroup>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem 
                key={`${item.href}-${index}`} 
                onClick={() => handleNavigation(item.href)}
                className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50 transition-colors"
              >
                <Icon size={16} className="opacity-60" aria-hidden="true" />
                <span>{item.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border/50" />

        <DropdownMenuItem 
          onClick={handleSignOut}
          className="cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 hover:text-destructive focus:text-destructive transition-colors"
        >
          <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
