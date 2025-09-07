import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user is authenticated
  const accessToken = request.cookies.get('accessToken')?.value;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/signup'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Auth routes
  const isAuthRoute = pathname.startsWith('/auth/');
  
  // If user is not authenticated and trying to access protected route
  if (!accessToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (accessToken && isAuthRoute && pathname !== '/auth/logout') {
    return NextResponse.redirect(new URL('/venues', request.url));
  }
  
  // If accessing root, redirect to venues (main dashboard)
  if (pathname === '/' && accessToken) {
    return NextResponse.redirect(new URL('/venues', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
