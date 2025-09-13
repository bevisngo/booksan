import Link from "next/link";
import React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Private App Header */}
      <header className="border-b bg-card fixed top-0 left-0 right-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gradient">Booksan</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/facilities"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Facilities
              </Link>
              <Link
                href="/bookings"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Bookings
              </Link>
              <Link
                href="/search"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Search
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">Notifications</span>
              🔔
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                U
              </div>
              <span className="hidden md:block text-sm font-medium">
                User Name
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Content */}
      <main className="flex-1 pt-16">{children}</main>
    </div>
  );
}
