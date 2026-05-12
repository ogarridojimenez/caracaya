import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const PUBLIC_ROUTES = ['/', '/login', '/register'];
const ADMIN_ROUTES = ['/admin'];
const STAFF_ROUTES = ['/pedidos', '/vendedor', '/contabilidad'];
const USER_ROUTES = ['/carrito', '/perfil', '/usuarios'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (!PUBLIC_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = userProfile?.role ?? 'cliente';
  const isManager = role === 'manager_admin';
  const isStaff = role === 'vendedor' || isManager;

  if (pathname.startsWith('/admin') && !isManager) {
    return NextResponse.redirect(new URL(redirectForRole(role), request.url));
  }

  if (STAFF_ROUTES.some(r => pathname.startsWith(r)) && !isStaff) {
    return NextResponse.redirect(new URL(redirectForRole(role), request.url));
  }

  return NextResponse.next();
}

function redirectForRole(role: string): string {
  const routes: Record<string, string> = {
    cliente: '/carrito',
    vendedor: '/vendedor',
    manager_admin: '/admin',
  };
  return routes[role] ?? '/';
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};