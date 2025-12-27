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
  IconSettings,
  IconUsers,
  IconUserCircle,
  IconHeart,
  IconStar,
  IconWallet,
  IconSpeakerphone,
  IconReceipt,
  IconArticle,
  IconKey,
  IconSchool,
  IconBook,
  IconCurrencyDollar,
  IconActivity,
  IconShield,
  IconChartLine,
  IconFileCheck,
  IconUsersGroup,
  IconClock,
  IconTrophy,
  IconEye,
  IconAlertTriangle,
  IconDatabase,
  IconInbox,
  IconCreditCard,
} from "@tabler/icons-react";
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
    hideFromAdmin: true, // Hide from admin users even if they have SuperAdmin membership
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
    title: "Subscription",
    url: "/admin/subscription",
    icon: IconCreditCard,
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
    requiresSuperAdmin: true,
    hideFromAdmin: true, // Hide from admin users even if they have SuperAdmin membership
  },
  {
    title: "Membership",
    url: "/admin/membership",
    icon: IconKey,
    requiresMembership: true, // Show when user has SuperAdmin membership but role is admin
  },
  // Superadmin-only features
  {
    title: "Teacher Performance",
    url: "/superadmin/teachers",
    icon: IconSchool,
    requiresSuperAdmin: true,
    hideFromAdmin: true, // Hide from admin users even if they have SuperAdmin membership
  },
  {
    title: "Course Analytics",
    url: "/superadmin/courses/analytics",
    icon: IconChartLine,
    requiresSuperAdmin: true,
  },
  {
    title: "Content Audit",
    url: "/superadmin/content-audit",
    icon: IconFileCheck,
    requiresSuperAdmin: true,
    hideFromAdmin: true, // Hide from admin users even if they have SuperAdmin membership
  },
  {
    title: "Financial Analytics",
    url: "/superadmin/financial",
    icon: IconCurrencyDollar,
    requiresSuperAdmin: true,
    hideFromAdmin: true, // Hide from admin users even if they have SuperAdmin membership
  },
  {
    title: "Engagement Analytics",
    url: "/superadmin/engagement",
    icon: IconActivity,
    requiresSuperAdmin: true,
    hideFromAdmin: true, // Hide from admin users even if they have SuperAdmin membership
  },
  {
    title: "User Management",
    url: "/superadmin/users",
    icon: IconUsersGroup,
    requiresSuperAdmin: true,
    hideFromAdmin: true, // Hide from admin users even if they have SuperAdmin membership
  },
  {
    title: "Security & Logs",
    url: "/superadmin/security",
    icon: IconShield,
    requiresSuperAdmin: true,
    hideFromAdmin: true, // Hide from admin users even if they have SuperAdmin membership
  },
  {
    title: "System Config",
    url: "/superadmin/config",
    icon: IconDatabase,
    requiresSuperAdmin: true,
    hideFromAdmin: true, // Hide from admin users even if they have SuperAdmin membership
  },
  {
    title: "Help Requests",
    url: "/superadmin/help-requests",
    icon: IconHelp,
    requiresSuperAdmin: true,
    hideFromAdmin: true, // Hide from admin users even if they have SuperAdmin membership
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
    title: "My Help Requests",
    url: "/admin/help-requests",
    icon: IconInbox,
  },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const hasSuperAdminMembership = (session?.user as { hasSuperAdminMembership?: boolean } | undefined)?.hasSuperAdminMembership;

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
          };
          return { ...item, url: urlMap[item.url] || item.url };
        }
        return item;
      })
      .filter((item) => {
        // If item should be hidden from admin users, only show to superadmin
        if ((item as any).hideFromAdmin) {
          return userRole === "superadmin";
        }
        // If item requires membership (for admin users with SuperAdmin membership)
        if ((item as any).requiresMembership) {
          return userRole === "admin" && hasSuperAdminMembership;
        }
        // If item requires superadmin, show for superadmin role OR admin with membership
        if (item.requiresSuperAdmin) {
          return userRole === "superadmin" || (userRole === "admin" && hasSuperAdminMembership);
        }
        // If item is adminOnly, only show for admin (not superadmin, not admin with membership)
        if (item.adminOnly) {
          return userRole === "admin" && !hasSuperAdminMembership;
        }
        // Otherwise show for all admin/superadmin users
        return userRole === "admin" || userRole === "superadmin";
      });
  }, [userRole, hasSuperAdminMembership]);

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
                <span className="text-base font-semibold text-gray-900 dark:text-white">Edupeak</span>
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
