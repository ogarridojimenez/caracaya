import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface OrderItemInput {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

interface CreateOrderBody {
  items: OrderItemInput[];
  pickupTime?: string;
  notes?: string;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
}

interface OrderItemRow {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  order_id: string;
}

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  let query = supabase
    .from('orders')
    .select('*, order_items(*), user:users(full_name)')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data: orders, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: orders ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: CreateOrderBody = await request.json();
    const { items, pickupTime, notes, subtotal, taxAmount, discountAmount } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Se requiere al menos un producto' }, { status: 400 });
    }

    const orderItems: Omit<OrderItemRow, 'order_id'>[] = items.map((item: OrderItemInput) => ({
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
      notes: item.notes || null,
    }));

    const total = subtotal + (taxAmount ?? 0) - (discountAmount ?? 0);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total,
        pickup_time: pickupTime || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const itemsToInsert: OrderItemRow[] = orderItems.map(item => ({ ...item, order_id: order.id }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    const { data: orderWithItems } = await supabase
      .from('orders')
      .select('*, order_items(*), user:users(full_name)')
      .eq('id', order.id)
      .single();

    return NextResponse.json({ data: orderWithItems }, { status: 201 });

  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}