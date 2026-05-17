import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  let query = supabase
    .from('orders')
    .select('created_at, status, total');

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

  const grouped = data.reduce((acc: Record<string, any>, order: any) => {
    const date = new Date(order.created_at).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, order_count: 0, revenue: 0, refunds: 0 };
    }
    acc[date].order_count++;
    if (order.status === 'completed') {
      acc[date].revenue += order.total;
    } else if (order.status === 'cancelled') {
      acc[date].refunds += order.total;
    }
    return acc;
  }, {});

  const result = Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date));

  return NextResponse.json({ data: result });
}