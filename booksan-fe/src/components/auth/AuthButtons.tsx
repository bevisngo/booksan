"use client";

import { useAuth } from "@/features/auth/context";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Welcome, {user.fullname}!
        </span>
        <a href="/dashboard">
          <Button variant="outline">Dashboard</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <a href="/auth/login">
        <Button variant="ghost">Sign In</Button>
      </a>
      <a href="/auth/signup">
        <Button>Get Started</Button>
      </a>
    </div>
  );
}
