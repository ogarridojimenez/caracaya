import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/helpers';

interface DailyCloseItem {
  total_price: number;
}

interface DailyClose {
  close_date: string;
  daily_close_items?: DailyCloseItem[];
  [key: string]: unknown;
}

interface Order {
  created_at?: string;
  total?: number;
  [key: string]: unknown;
}

interface CloseWithTotals extends DailyClose {
  orders_total: number;
  manual_total: number;
  grand_total: number;
}

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ['manager_admin', 'vendedor']);
  if ('error' in auth) return auth.error;

  const { supabase } = auth.success;

  const { data: closes, error } = await supabase
    .from('daily_closes')
    .select('*, daily_close_items(*)')
    .order('close_date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('created_at, total')
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  const closesWithTotals: CloseWithTotals[] = closes.map((close: DailyClose) => {
    const closeDateStr = String(close.close_date);

    const dayOrders = (orders ?? []).filter((o: Order) => {
      if (!o.created_at) return false;
      const od = new Date(o.created_at);
      const oy = od.getFullYear();
      const om = String(od.getMonth() + 1).padStart(2, '0');
      const od2 = String(od.getDate()).padStart(2, '0');
      return `${oy}-${om}-${od2}` === closeDateStr;
    });

    const ordersTotal = dayOrders.reduce((sum: number, o: Order) => sum + (o.total || 0), 0);

    const manualTotal = (close.daily_close_items ?? []).reduce(
      (sum: number, item: DailyCloseItem) => sum + (item.total_price || 0),
      0
    );

    return {
      ...close,
      orders_total: ordersTotal,
      manual_total: manualTotal,
      grand_total: ordersTotal + manualTotal,
    };
  });

  return NextResponse.json({ data: closesWithTotals, orders: orders ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ['manager_admin', 'vendedor']);
  if ('error' in auth) return auth.error;

  const { supabase, userId } = auth.success;

  const body = await request.json();

  const { close_date, cash_total, card_total, transfer_total, notes } = body;

  if (!close_date) {
    return NextResponse.json({ error: 'close_date es requerido' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('daily_closes')
    .insert({
      close_date,
      cash_total: cash_total ?? 0,
      card_total: card_total ?? 0,
      transfer_total: transfer_total ?? 0,
      notes: notes ?? '',
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}