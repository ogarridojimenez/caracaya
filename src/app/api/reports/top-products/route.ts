import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/helpers';

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  orders?: { status: string } | { status: string }[];
}

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ['manager_admin', 'vendedor']);
  if ('error' in auth) return auth.error;

  const { supabase } = auth.success;

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const limit = parseInt(searchParams.get('limit') || '10');

  let query = supabase
    .from('order_items')
    .select('product_name, quantity, unit_price, total_price, created_at, orders(status, created_at)')
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

  const filteredItems = items?.filter((item: OrderItem) => {
    const orders = item.orders;
    if (Array.isArray(orders)) {
      return orders.some(o => o.status === 'completed');
    }
    return orders?.status === 'completed';
  }) || [];

  const productStats = filteredItems.reduce<Record<string, TopProduct>>((acc, item: OrderItem) => {
    const name = item.product_name;
    if (!acc[name]) {
      acc[name] = { name, quantity: 0, revenue: 0 };
    }
    acc[name].quantity += item.quantity;
    acc[name].revenue += item.total_price;
    return acc;
  }, {});

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);

  return NextResponse.json({ data: topProducts });
}