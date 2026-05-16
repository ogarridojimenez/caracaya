import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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
  const supabase = createServerSupabaseClient(request);
  
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error: any) {
    console.error('[API/products POST] Auth error:', error?.message ?? 'Unknown');
    const errorCode = error?.__authError?.code ?? error?.code ?? '';
    if (errorCode === 'refresh_token_not_found' || errorCode === 'invalid_refresh_token') {
      return NextResponse.json({ error: 'Sesión expirada. Por favor, inicia sesión nuevamente.' }, { status: 401 });
    }
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  const { data, error } = await supabase
    .from('products')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}