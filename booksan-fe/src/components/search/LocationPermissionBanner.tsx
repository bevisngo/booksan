import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navigation } from 'lucide-react'

interface LocationPermissionBannerProps {
  permission: 'granted' | 'denied' | 'prompt'
  onRequestLocation: () => void
}

export function LocationPermissionBanner({ 
  permission, 
  onRequestLocation 
}: LocationPermissionBannerProps) {
  if (permission !== 'prompt') return null

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Enable Location Access</p>
              <p className="text-sm text-blue-700">
                Get personalized results sorted by distance from your location
              </p>
            </div>
          </div>
          <Button onClick={onRequestLocation} size="sm">
            Enable Location
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
