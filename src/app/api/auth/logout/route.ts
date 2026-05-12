import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();

  const response = NextResponse.json({ success: true });
  response.cookies.delete('sb-access-token');

  return response;
}