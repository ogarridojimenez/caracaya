import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userData || !['vendedor', 'manager_admin'].includes(userData.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: closes, error } = await supabase
    .from('daily_closes')
    .select(`
      *,
      daily_close_items (*)
    `)
    .order('close_date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  const closesWithTotals = closes.map(close => {
    const closeDateStr = String(close.close_date);

    const dayOrders = (orders ?? []).filter(o => {
      if (!o.created_at) return false;
      const od = new Date(o.created_at);
      const oy = od.getFullYear();
      const om = String(od.getMonth() + 1).padStart(2, '0');
      const od2 = String(od.getDate()).padStart(2, '0');
      return `${oy}-${om}-${od2}` === closeDateStr;
    });

    const ordersTotal = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const manualTotal = (close.daily_close_items ?? []).reduce(
      (sum, item) => sum + (item.total_price || 0), 0
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