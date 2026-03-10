import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = ['/login', '/register', '/api/auth/login', '/api/auth/register'];

// Static assets and API config are always public
const isPublicPath = (path: string) => {
  return (
    publicPaths.some((p) => path.startsWith(p)) ||
    path.startsWith('/_next/') ||
    path.startsWith('/static/') ||
    path.startsWith('/api/config') ||
    path.includes('.')
  );
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get('session');

  if (!sessionCookie) {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Match all paths except static assets handled by Next.js
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
