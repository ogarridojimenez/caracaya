import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  let query = supabase
    .from('orders')
    .select('status, total');

  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const completed = data.filter((o: any) => o.status === 'completed');
  const cancelled = data.filter((o: any) => o.status === 'cancelled');

  const totalRevenue = completed.reduce((sum: number, o: any) => sum + o.total, 0);
  const totalRefunds = cancelled.reduce((sum: number, o: any) => sum + o.total, 0);

  return NextResponse.json({
    total_orders: completed.length,
    total_revenue: totalRevenue,
    total_refunds: totalRefunds,
    avg_order: completed.length > 0 ? totalRevenue / completed.length : 0,
  });
}