import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { withAuth, isAdmin } from '@/lib/auth/helpers';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get('featured') === 'true';
  const categoryId = searchParams.get('categoryId');

  let query = supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .order('name');

  if (featured) {
    query = query.eq('is_featured', true);
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count: data?.length ?? 0 });
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['manager_admin']);

  if ('error' in authResult) {
    return authResult.error;
  }

  const { success } = authResult;
  if (!isAdmin(success.role)) {
    return NextResponse.json({ error: 'Forbidden: Solo administradores pueden crear productos' }, { status: 403 });
  }

  const body = await request.json();

  const { data, error } = await success.supabase
    .from('products')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}