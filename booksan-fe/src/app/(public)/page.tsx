import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find & Book <span className="text-gradient">Sports Venues</span>{" "}
            Near You
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover amazing sports facilities, book instantly, and play your
            favorite sports with friends. From tennis courts to football fields,
            we have it all.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/venues/search">
              <Button size="lg">Find Venues</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" size="lg">
                List Your Venue
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Booksan?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We make it easy to find, book, and enjoy sports venues in your
              area.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔍 Easy Discovery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Find venues by location, sport, price, and availability. Our
                  smart search helps you discover the perfect place to play.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚡ Instant Booking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Book venues instantly with our streamlined booking process. No
                  more phone calls or waiting for confirmations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏆 Quality Assured
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All venues are verified and rated by our community. Read
                  reviews and see photos before you book.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sports Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Popular Sports
            </h2>
            <p className="text-xl text-muted-foreground">
              Find venues for all your favorite sports and activities.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Tennis", icon: "🎾" },
              { name: "Basketball", icon: "🏀" },
              { name: "Football", icon: "⚽" },
              { name: "Badminton", icon: "🏸" },
              { name: "Volleyball", icon: "🏐" },
              { name: "Swimming", icon: "🏊‍♂️" },
            ].map((sport) => (
              <Card
                key={sport.name}
                className="text-center hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="pt-6">
                  <div className="text-4xl mb-2">{sport.icon}</div>
                  <p className="font-medium">{sport.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Play?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of players who use Booksan to find and book amazing
            sports venues.
          </p>
          <a href="/auth/signup">
            <Button size="lg" variant="secondary">
              Get Started Today
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
