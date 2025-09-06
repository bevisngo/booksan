"use client";

import { useAuth } from "@/features/auth/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserProfileProps {
  showLogout?: boolean;
  className?: string;
}

export function UserProfile({ showLogout = true, className }: UserProfileProps) {
  const { user, logout, isLoading } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.fullname)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-lg">{user.fullname}</CardTitle>
            <CardDescription>
              {user.email || user.phone}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Role:</span>
            <span className="capitalize">{user.role.toLowerCase()}</span>
          </div>
          <div className="flex justify-between">
            <span>Member since:</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {showLogout && (
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full mt-4"
          >
            {isLoading ? "Signing out..." : "Sign Out"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
