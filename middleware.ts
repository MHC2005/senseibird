import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware simplificado: ya no valida sesión de Supabase
export async function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next).*)'],
};
