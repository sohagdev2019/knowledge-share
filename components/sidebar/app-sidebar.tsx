"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconSearch,
  IconSettings,
  IconUsers,
  IconUserCircle,
  IconHeart,
  IconStar,
  IconWallet,
  IconSpeakerphone,
  IconReceipt,
  IconArticle,
} from "@tabler/icons-react";
import Logo from "@/public/logo.png";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

const allNavMainItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: IconDashboard,
  },
  {
    title: "Courses",
    url: "/admin/courses",
    icon: IconListDetails,
    adminOnly: true, // Only visible to admin, not superadmin
  },
  {
    title: "Blogs",
    url: "/admin/blogs",
    icon: IconArticle,
    requiresSuperAdmin: true,
  },
  {
    title: "My Profile",
    url: "/admin/profile",
    icon: IconUserCircle,
  },
  {
    title: "Wishlist",
    url: "/admin/wishlist",
    icon: IconHeart,
    adminOnly: true, // Only visible to admin, not superadmin
  },
  {
    title: "Reviews",
    url: "/admin/reviews",
    icon: IconStar,
    adminOnly: true, // Only visible to admin, not superadmin
  },
  {
    title: "Withdrawals",
    url: "/admin/withdrawals",
    icon: IconWallet,
    adminOnly: true, // Only visible to admin, not superadmin
  },
  {
    title: "Announcements",
    url: "/admin/announcements",
    icon: IconSpeakerphone,
  },
  {
    title: "Order History",
    url: "/admin/order-history",
    icon: IconReceipt,
    adminOnly: true, // Only visible to admin, not superadmin
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: IconChartBar,
  },
  {
    title: "Projects",
    url: "/admin/projects",
    icon: IconFolder,
    adminOnly: true, // Only visible to admin, not superadmin
  },
  {
    title: "Team",
    url: "/admin/team",
    icon: IconUsers,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: IconUsers,
    requiresSuperAdmin: true,
  },
];

const data = {
  navMain: allNavMainItems,
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/admin/get-help",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "/admin/search",
      icon: IconSearch,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  // Filter nav items based on user role
  const navMainItems = React.useMemo(() => {
    return allNavMainItems
      .map((item) => {
        // For superadmin users, update all URLs to use /superadmin prefix
        if (userRole === "superadmin") {
          // Map admin routes to superadmin routes (excluding adminOnly items)
          const urlMap: Record<string, string> = {
            "/admin": "/superadmin",
            "/admin/blogs": "/superadmin/blogs",
            "/admin/profile": "/superadmin/profile",
            "/admin/announcements": "/superadmin/announcements",
            "/admin/analytics": "/superadmin/analytics",
            "/admin/team": "/superadmin/team",
            "/admin/users": "/superadmin/users",
          };
          return { ...item, url: urlMap[item.url] || item.url };
        }
        return item;
      })
      .filter((item) => {
        // If item requires superadmin, only show for superadmin
        if (item.requiresSuperAdmin) {
          return userRole === "superadmin";
        }
        // If item is adminOnly, only show for admin (not superadmin)
        if (item.adminOnly) {
          return userRole === "admin";
        }
        // Otherwise show for all admin/superadmin users
        return userRole === "admin" || userRole === "superadmin";
      });
  }, [userRole]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <Image src={Logo} alt="Logo" className="size-5" />
                <span className="text-base font-semibold">KnowledgeShare.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />

        <NavSecondary 
          items={userRole === "superadmin" 
            ? data.navSecondary.map(item => ({
                ...item,
                url: item.url.replace("/admin/", "/superadmin/")
              }))
            : data.navSecondary
          } 
          className="mt-auto" 
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
