import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserProfile } from '@/components/auth/UserProfile'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your bookings.
          </p>
        </div>

        {/* User Profile Section */}
        <div className="mb-8">
          <UserProfile />
        </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Games</CardTitle>
            <span className="text-2xl">⚡</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Next: Tomorrow at 7 PM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Venues</CardTitle>
            <span className="text-2xl">❤️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Saved for quick booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$420</div>
            <p className="text-xs text-muted-foreground">Total spent</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>Your next scheduled games and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Tennis Court A</h4>
                  <p className="text-sm text-muted-foreground">Tomorrow, 7:00 PM - 8:00 PM</p>
                  <p className="text-sm text-muted-foreground">City Sports Center</p>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Basketball Court</h4>
                  <p className="text-sm text-muted-foreground">Friday, 6:00 PM - 7:30 PM</p>
                  <p className="text-sm text-muted-foreground">Downtown Arena</p>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Badminton Court 2</h4>
                  <p className="text-sm text-muted-foreground">Sunday, 2:00 PM - 3:00 PM</p>
                  <p className="text-sm text-muted-foreground">Sports Complex</p>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            </div>
            
            <a href="/bookings" className="w-full mt-4 block">
              <Button className="w-full">View All Bookings</Button>
            </a>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you playing faster</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/venues/search">
                <Button className="w-full">Find Venues</Button>
              </Link>
              <Link href="/venues">
                <Button variant="outline" className="w-full">Browse Venues</Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full">Edit Profile</Button>
              </Link>
              <Link href="/wallet">
                <Button variant="outline" className="w-full">Manage Wallet</Button>
              </Link>
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">💡 Quick Tip</h4>
              <p className="text-sm text-muted-foreground">
                Book your regular games in advance to secure your preferred time slots and get better rates!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  )
}
