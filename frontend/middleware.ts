import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define route groups
  const protectedRoutes = ["/home"];
  const authRoutes = ["/login", "/signup"];
  
  // Check for refresh token (since access token is now in memory)
  // We'll check for any auth-related cookie that indicates user might be logged in
  const hasRefreshToken = request.cookies.get("refreshToken")?.value || 
                         request.cookies.has("connect.sid") || // If you're using express-session
                         request.cookies.has("auth-token"); // Or any other auth cookie name your backend sets

  // If user tries to access auth pages while potentially logged in, redirect to dashboard
  // Note: This is a soft check since we can't verify the token validity in middleware
  if (hasRefreshToken && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // For protected routes, we'll let the client-side auth context handle the redirect
  // since the access token is in memory and not accessible in middleware
  // The middleware now primarily handles the auth pages redirect

  return NextResponse.next();
}

// Configure which routes the middleware should run on
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
}