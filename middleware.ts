import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/sign-in', '/sign-up', '/search', '/product'];
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Admin routes
  const isAdminRoute = pathname.startsWith('/admin');
  
  // User routes
  const isUserRoute = pathname.startsWith('/user');

  // If accessing admin routes, require admin role
  if (isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // If accessing user routes, require authentication
  if (isUserRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/shipping-address', '/payment-method', '/place-order', '/order'];
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};