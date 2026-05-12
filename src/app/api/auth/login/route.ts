import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient(request);
  const { email, password } = await request.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('id, email, full_name, role')
    .eq('id', data.user.id)
    .single();

  const response = NextResponse.json({
    user: userProfile ?? { id: data.user.id, email: data.user.email, full_name: null, role: 'cliente' },
  });

  response.cookies.set('sb-access-token', data.session?.access_token ?? '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return response;
}