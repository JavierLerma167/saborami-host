import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtener la ruta actual
  const path = request.nextUrl.pathname;
  
  // Rutas públicas (no requieren autenticación)
  const publicPaths = ['/', '/api/auth'];
  const isPublicPath = publicPaths.includes(path);
  
  // Obtener token de autenticación (de las cookies)
  const token = request.cookies.get('__session')?.value || '';
  
  // Si no está autenticado y trata de acceder a ruta protegida
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Si está autenticado y trata de acceder a login
  if (token && path === '/') {
    return NextResponse.redirect(new URL('/iniciosaborami', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};