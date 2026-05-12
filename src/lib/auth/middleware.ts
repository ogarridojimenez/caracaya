import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const PUBLIC_ROUTES = ['/login', '/register', '/'];
const MANAGER_ROUTES = ['/admin'];
const PROTECTED_ROUTES = ['/pedidos'];

export async function updateSession(request: NextRequest) {
  let supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set(name, value);
          const response = NextResponse.next();
          response.cookies.set(name, value, options);
          return response;
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set(name, '');
          const response = NextResponse.next();
          response.cookies.set(name, '', options);
          return response;
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

  return NextResponse.next();
}
