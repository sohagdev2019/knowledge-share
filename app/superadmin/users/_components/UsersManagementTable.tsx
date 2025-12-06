"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatDistanceToNow } from "@/lib/date-utils";
import { useRouter } from "next/navigation";
import { Shield, User, GraduationCap, Ban, CheckCircle2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  role: string | null;
  createdAt: Date;
  emailVerified: boolean;
  banned: boolean | null;
  _count: {
    enrollment: number;
    courses: number;
  };
}

interface UsersManagementTableProps {
  users: User[];
  total: number;
  currentPage: number;
  role: string;
  search: string;
}

export function UsersManagementTable({
  users,
  total,
  currentPage,
  role,
  search,
}: UsersManagementTableProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(search);

  const handleRoleChange = (newRole: string) => {
    const params = new URLSearchParams();
    if (newRole !== "all") params.set("role", newRole);
    if (searchQuery) params.set("search", searchQuery);
    router.push(`/superadmin/users?${params.toString()}`);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (role !== "all") params.set("role", role);
    if (searchQuery) params.set("search", searchQuery);
    router.push(`/superadmin/users?${params.toString()}`);
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    setProcessing(userId);
    try {
      const response = await fetch(`/api/superadmin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Role updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update role");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setProcessing(null);
    }
  };

  const handleBanToggle = async (userId: string, isBanned: boolean) => {
    setProcessing(userId);
    try {
      const response = await fetch(`/api/superadmin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: !isBanned }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || `User ${!isBanned ? "banned" : "unbanned"} successfully`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update user status");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setProcessing(null);
    }
  };

  const getRoleIcon = (userRole: string | null) => {
    switch (userRole) {
      case "superadmin":
        return <Shield className="w-4 h-4 text-purple-500" />;
      case "admin":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (userRole: string | null) => {
    switch (userRole) {
      case "superadmin":
        return <Badge variant="default" className="bg-purple-500">Super Admin</Badge>;
      case "admin":
        return <Badge variant="default" className="bg-blue-500">Admin</Badge>;
      default:
        return <Badge variant="outline">Student</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Search by email, name, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="max-w-sm"
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>
        <Select value={role} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="superadmin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="null">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Stats</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {getRoleIcon(user.role)}
                    <div>
                      <p className="font-semibold">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.username && (
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  <div className="flex flex-col gap-1">
                    <span>📚 {user._count.courses} courses</span>
                    <span>🎓 {user._count.enrollment} enrollments</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {user.emailVerified ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Unverified
                      </Badge>
                    )}
                    {user.banned && (
                      <Badge variant="destructive">Banned</Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <Select
                      value={user.role || "null"}
                      onValueChange={(newRole) =>
                        handleRoleUpdate(user.id, newRole === "null" ? "" : newRole)
                      }
                      disabled={processing === user.id}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">Student</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="superadmin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant={user.banned ? "default" : "destructive"}
                      size="sm"
                      onClick={() => handleBanToggle(user.id, user.banned || false)}
                      disabled={processing === user.id}
                      className="w-full"
                    >
                      <Ban className="w-3 h-3 mr-1" />
                      {user.banned ? "Unban" : "Ban"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No users found
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        Total: {total} users
      </div>
    </div>
  );
}
