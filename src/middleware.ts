import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rutas públicas que no necesitan auth
  if (['/', '/login', '/register'].includes(pathname)) {
    return NextResponse.next();
  }

  // Proteger rutas de admin
  if (pathname.startsWith('/admin') || pathname.startsWith('/usuarios')) {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userProfile?.role !== 'manager_admin') {
      const dashboardRoutes: Record<string, string> = {
        cliente: '/carrito',
        vendedor: '/vendedor',
        manager_admin: '/admin',
      };
      const redirectPath = dashboardRoutes[userProfile?.role ?? 'cliente'] ?? '/carrito';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};