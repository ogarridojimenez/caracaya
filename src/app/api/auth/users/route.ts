import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/helpers';

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ['manager_admin']);
  if ('error' in auth) return auth.error;

  const { supabase } = auth.success;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ['manager_admin']);
  if ('error' in auth) return auth.error;

  const { supabase } = auth.success;

  const { email, password, name, role = 'cliente' } = await request.json();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, role },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}