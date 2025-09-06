'use client'

import React from 'react'
import { QueryProvider } from './query-provider'
import { ThemeProvider } from './theme-provider'
import { AuthProvider } from '@/features/auth/context'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}

export { useTheme } from './theme-provider'
