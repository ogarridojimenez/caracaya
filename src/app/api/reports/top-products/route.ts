import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/helpers';

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ['manager_admin', 'vendedor']);
  if ('error' in auth) return auth.error;

  const { supabase } = auth.success;

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const limit = parseInt(searchParams.get('limit') || '10');

  const { data, error } = await supabase.rpc('get_top_products', {
    p_limit: limit,
    p_start_date: startDate || null,
    p_end_date: endDate || null,
  });

  if (error) {
    console.error('[API/reports/top-products]', error.message);
    return NextResponse.json({ error: 'Error al obtener productos más vendidos' }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}