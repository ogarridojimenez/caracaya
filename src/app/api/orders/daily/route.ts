import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/helpers';

interface DailyGroup {
  date: string;
  order_count: number;
  revenue: number;
  refunds: number;
}

interface OrderRow {
  created_at: string;
  status: string;
  total: number;
}

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ['manager_admin', 'vendedor']);
  if ('error' in auth) return auth.error;

  const { supabase } = auth.success;

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
    console.error('[API/orders/daily]', error.message);
    return NextResponse.json({ error: 'Error al obtener pedidos diarios' }, { status: 500 });
  }

  const grouped = (data ?? []).reduce<Record<string, DailyGroup>>((acc, order: OrderRow) => {
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

  const result = Object.values(grouped).sort((a: DailyGroup, b: DailyGroup) => a.date.localeCompare(b.date));

  return NextResponse.json({ data: result });
}