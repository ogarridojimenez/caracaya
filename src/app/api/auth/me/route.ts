import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createServerSupabaseClient();
  
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error: any) {
    console.error('[API/auth/me] Auth error:', error?.message ?? 'Unknown');
  }

  if (!user) {
    return NextResponse.json({ user: null });
  }

  const { data: userData } = await supabase
    .from('users')
    .select('id, email, full_name, role, phone, avatar_url, created_at, updated_at')
    .eq('id', user.id)
    .single();

  return NextResponse.json({ user: userData });
}