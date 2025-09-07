import { AuthButtons } from "@/components/auth/AuthButtons";
import Link from "next/link";
import React from "react";

interface SearchLayoutProps {
  children: React.ReactNode;
}

export default function SearchLayout({ children }: SearchLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <header className="border-b bg-card fixed top-0 left-0 right-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gradient">Booksan</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/venues/search"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Find Venues
              </Link>
              <a
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </a>
              <a
                href="/contact"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <AuthButtons />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">{children}</main>
    </div>
  );
}
