import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { orderEvents } from '@/lib/order-events';

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
  const supabase = createServerSupabaseClient(request);

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error: any) {
    console.error('[API/orders GET] Auth error:', error?.message ?? 'Unknown');
    const errorCode = error?.__authError?.code ?? error?.code ?? '';
    if (errorCode === 'refresh_token_not_found' || errorCode === 'invalid_refresh_token') {
      return NextResponse.json({ error: 'Sesión expirada. Por favor, inicia sesión nuevamente.' }, { status: 401 });
    }
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '10');
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = userData?.role ?? 'cliente';
  const isStaff = userRole === 'vendedor' || userRole === 'manager_admin';

  let query = supabase
    .from('orders')
    .select('*, order_items(*), user:users(full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (userRole === 'cliente') {
    query = query.eq('user_id', user.id);
  }

  const { data: orders, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: orders ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient(request);

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error: any) {
    console.error('[API/orders] Auth error:', error?.message ?? 'Unknown');
    const errorCode = error?.__authError?.code ?? error?.code ?? '';
    if (errorCode === 'refresh_token_not_found' || errorCode === 'invalid_refresh_token') {
      return NextResponse.json({ error: 'Sesión expirada. Por favor, inicia sesión nuevamente.' }, { status: 401 });
    }
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: CreateOrderBody = await request.json();
    const { items, pickupTime, notes, subtotal, taxAmount, discountAmount } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Se requiere al menos un producto' }, { status: 400 });
    }

    const productIds = items.map((item: OrderItemInput) => item.productId);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, stock_quantity, is_available')
      .in('id', productIds);

    if (productsError) {
      return NextResponse.json({ error: 'Error al verificar productos' }, { status: 500 });
    }

    const unavailableItems: string[] = [];
    for (const item of items) {
      const product = products?.find(p => p.id === item.productId);
      if (!product) {
        unavailableItems.push(`${item.productName}: Producto no encontrado`);
      } else if (!product.is_available) {
        unavailableItems.push(`${item.productName}: No disponible`);
      } else if (product.stock_quantity < item.quantity) {
        unavailableItems.push(`${item.productName}: Stock insuficiente (disponible: ${product.stock_quantity})`);
      }
    }

    if (unavailableItems.length > 0) {
      return NextResponse.json({ error: unavailableItems.join(', '), available: false }, { status: 400 });
    }

    const stockResults: { productId: string; quantity: number }[] = [];

    for (const item of items) {
      const { data: success, error: rpcError } = await supabase.rpc('decrement_stock', {
        p_product_id: item.productId,
        p_quantity: item.quantity
      });

      if (rpcError || !success) {
        for (const stockItem of stockResults) {
          await supabase.rpc('increment_stock', {
            p_product_id: stockItem.productId,
            p_quantity: stockItem.quantity
          });
        }
        return NextResponse.json({ error: `Stock insuficiente para ${item.productName}` }, { status: 400 });
      }

      stockResults.push({ productId: item.productId, quantity: item.quantity });
    }

    const rollbackStock = async () => {
      for (const stockItem of stockResults) {
        await supabase.rpc('increment_stock', {
          p_product_id: stockItem.productId,
          p_quantity: stockItem.quantity
        });
      }
    };

    const orderItems: Omit<OrderItemRow, 'order_id'>[] = items.map((item: OrderItemInput) => ({
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
      notes: item.notes || null,
    }));

    const total = subtotal + (taxAmount ?? 0) - (discountAmount ?? 0);

    let pickupTimeValue: string | null = null;
    if (pickupTime) {
      const today = new Date().toISOString().split('T')[0];
      pickupTimeValue = `${today}T${pickupTime}:00`;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        subtotal,
        total,
        tax_amount: taxAmount ?? 0,
        discount_amount: discountAmount ?? 0,
        pickup_time: pickupTimeValue,
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) {
      await rollbackStock();
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const itemsToInsert: OrderItemRow[] = orderItems.map(item => ({ ...item, order_id: order.id }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id);
      await rollbackStock();
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    const { data: orderWithItems } = await supabase
      .from('orders')
      .select('*, order_items(*), user:users(full_name)')
      .eq('id', order.id)
      .single();

    orderEvents.emit({
      orderId: order.id,
      orderNumber: order.order_number,
      customerName: orderWithItems?.user?.full_name ?? 'Cliente',
      status: order.status,
      total: order.total,
      items: orderItems.length,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ data: orderWithItems }, { status: 201 });

  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}