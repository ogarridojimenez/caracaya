import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll() {
          return req.cookies.getAll().map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  const publicRoutes = ['/', '/login', '/register', '/api/auth'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (!user && !isPublicRoute) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Solo consultar la tabla users cuando hay usuario y la ruta necesita verificación de rol
  if (user) {
    const needsRoleCheck = ['/admin', '/vendedor', '/contabilidad'].some(
      route => pathname.startsWith(route)
    );

    if (needsRoleCheck) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const userRole = userData?.role;
      const protectedRoutes: Record<string, string[]> = {
        '/admin': ['manager_admin'],
        '/vendedor': ['vendedor', 'manager_admin'],
        '/contabilidad': ['manager_admin'],
      };

      for (const [route, roles] of Object.entries(protectedRoutes)) {
        if (pathname.startsWith(route) && !roles.includes(userRole as string)) {
          const url = req.nextUrl.clone();
          url.pathname = '/login';
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)'],
};
