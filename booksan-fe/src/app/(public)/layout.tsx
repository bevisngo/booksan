import { AuthButtons } from "@/components/auth/AuthButtons";
import Link from "next/link";
import React from "react";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Public Header */}
      <header className="border-b bg-card fixed top-0 left-0 right-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gradient">Booksan</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/facilities/search"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Find Facilities
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

      {/* Public Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Booksan</h3>
              <p className="text-muted-foreground text-sm">
                Find and book sports facilities near you. Play your favorite sports
                with ease.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/facilities/search"
                    className="hover:text-foreground transition-colors"
                  >
                    Find Facilities
                  </Link>
                </li>
                <li>
                  <a
                    href="/auth/signup"
                    className="hover:text-foreground transition-colors"
                  >
                    List Your Facility
                  </a>
                </li>
                <li>
                  <a
                    href="/pricing"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="/about"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="/careers"
                    className="hover:text-foreground transition-colors"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Booksan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
