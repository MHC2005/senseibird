import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const protectedPaths = ['/lesson', '/course'];
  const path = req.nextUrl.pathname;
  const needsAuth = protectedPaths.some((p) => path.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = {
  matcher: ['/lesson/:path*', '/course/:path*'],
};
