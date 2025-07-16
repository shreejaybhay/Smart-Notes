import { NextResponse } from "next/server";
import { auth } from "./src/lib/auth";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Skip middleware for API routes, static files, and NextAuth routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    // Get the session from the request
    const session = await auth();

    // Auth pages that logged-in users should not access
    const authPages = [
      '/',
      '/login',
      '/signup',
      '/forgot-password',
      '/reset-password'
    ];

    // If user is authenticated and tries to access auth pages, redirect to dashboard
    if (session && authPages.includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/notes', '/profile', '/settings'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // If trying to access protected route without authentication, redirect to login
    if (isProtectedRoute && !session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Allow access to other routes
    return NextResponse.next();
  } catch (error) {
    // Handle middleware errors silently
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
