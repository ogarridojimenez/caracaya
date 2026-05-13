import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register', '/api/auth/recover'];
const ADMIN_ROUTES = ['/admin'];
const STAFF_ROUTES = ['/pedidos', '/vendedor', '/contabilidad'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log(`[MIDDLEWARE] ${request.method} ${pathname}`);

  if (PUBLIC_ROUTES.includes(pathname)) {
    console.log(`[MIDDLEWARE] Public route: ${pathname}`);
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = parseCookieHeader(request.headers.get('Cookie') ?? '');
          return cookies.map(c => ({ name: c.name, value: c.value ?? '' }));
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          });
          if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
              response.headers.set(key, value);
            });
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
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
    return NextResponse.redirect(new URL('/vendedor', request.url));
  }

  if (STAFF_ROUTES.some(r => pathname.startsWith(r)) && !isStaff) {
    return NextResponse.redirect(new URL('/carrito', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};