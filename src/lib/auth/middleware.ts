import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_ROUTES = ['/login', '/register', '/'];
const MANAGER_ROUTES = ['/admin'];
const PROTECTED_ROUTES = ['/pedidos', '/carrito', '/vendedor', '/contabilidad'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (PUBLIC_ROUTES.includes(pathname) && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isManagerRoute = MANAGER_ROUTES.some((route) => pathname.startsWith(route));

  if (!user && (isProtectedRoute || isManagerRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user && isManagerRoute) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'manager_admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}