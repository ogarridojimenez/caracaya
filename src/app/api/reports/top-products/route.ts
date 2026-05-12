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

  if (userData?.role !== 'manager_admin' && userData?.role !== 'vendedor') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const limit = parseInt(searchParams.get('limit') || '10');

  let query = supabase
    .from('order_items')
    .select('product_name, quantity, unit_price, total_price, orders(status, created_at)')
    .order('quantity', { ascending: false });

  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data: items, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const filteredItems = items?.filter((item: any) => {
    const order = item.orders as any;
    return order?.status === 'completed';
  }) || [];

  const productStats = filteredItems.reduce((acc: any, item: any) => {
    const name = item.product_name;
    if (!acc[name]) {
      acc[name] = { name, quantity: 0, revenue: 0 };
    }
    acc[name].quantity += item.quantity;
    acc[name].revenue += item.total_price;
    return acc;
  }, {});

  const topProducts = Object.values(productStats)
    .sort((a: any, b: any) => b.quantity - a.quantity)
    .slice(0, limit);

  return NextResponse.json({ data: topProducts });
}