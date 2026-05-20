import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { orderEvents } from '@/lib/order-events';
import { validateBody, z } from '@/lib/validations';

const orderItemInputSchema = z.object({
  productId: z.string().uuid('ID de producto inválido'),
  productName: z.string().min(1),
  quantity: z.number().int().positive('Cantidad debe ser positiva'),
  unitPrice: z.number().positive('Precio debe ser positivo'),
  notes: z.string().max(200).optional(),
});

const createOrderBodySchema = z.object({
  items: z.array(orderItemInputSchema).min(1, 'Se requiere al menos un producto'),
  pickupTime: z.string().optional(),
  notes: z.string().max(500).optional(),
  taxAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
});

type OrderItemInput = z.infer<typeof orderItemInputSchema>;

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
    if (isStaff) {
      query = query.eq('user_id', userId);
    } else if (userId === user.id) {
      query = query.eq('user_id', user.id);
    } else {
      return NextResponse.json({ error: 'Forbidden: No puedes ver pedidos de otros usuarios' }, { status: 403 });
    }
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
    const validation = await validateBody(request, createOrderBodySchema);
    if (!validation.success) {
      return validation.error;
    }

    const { items, pickupTime, notes, taxAmount, discountAmount } = validation.data;

    // Verificar precios del servidor y calcular subtotal real
    const productIds = items.map((item: OrderItemInput) => item.productId);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity, is_available')
      .in('id', productIds);

    if (productsError) {
      return NextResponse.json({ error: 'Error al verificar productos' }, { status: 500 });
    }

    let calculatedSubtotal = 0;
    const itemsWithServerPrice: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      notes: string | null;
    }> = [];

    for (const item of items) {
      const product = products?.find(p => p.id === item.productId);
      if (!product) {
        return NextResponse.json({ error: `${item.productName}: Producto no encontrado` }, { status: 400 });
      }
      if (!product.is_available) {
        return NextResponse.json({ error: `${item.productName}: No disponible` }, { status: 400 });
      }
      if (product.stock_quantity < item.quantity) {
        return NextResponse.json({ error: `${item.productName}: Stock insuficiente (disponible: ${product.stock_quantity})` }, { status: 400 });
      }
      calculatedSubtotal += product.price * item.quantity;
      itemsWithServerPrice.push({
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: product.price * item.quantity,
        notes: item.notes || null,
      });
    }

    const total = calculatedSubtotal + (taxAmount ?? 0) - (discountAmount ?? 0);

    let pickupTimeValue: string | null = null;
    if (pickupTime) {
      const today = new Date().toISOString().split('T')[0];
      pickupTimeValue = `${today}T${pickupTime}:00`;
    }

    // Crear la orden directamente (el trigger genera order_number)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        subtotal: calculatedSubtotal,
        tax_amount: taxAmount ?? 0,
        discount_amount: discountAmount ?? 0,
        total,
        pickup_time: pickupTimeValue,
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('[API/orders] Order creation failed:', orderError.message);
      return NextResponse.json({ error: 'Error al crear el pedido' }, { status: 500 });
    }

    // Crear los items de la orden
    const orderItems = itemsWithServerPrice.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      notes: item.notes,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('[API/orders] Order items creation failed:', itemsError.message);
      // Intentar eliminar la orden huérfana
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: 'Error al crear los items del pedido' }, { status: 500 });
    }

    // Decrementar stock de cada producto (atómico)
    for (const item of itemsWithServerPrice) {
      const { error: stockError } = await supabase.rpc('decrement_stock', {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      });
      if (stockError) {
        console.error('[API/orders] Stock decrement failed:', stockError.message);
      }
    }

    // Consultar la orden completa con items para la respuesta
    const { data: fullOrder } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order.id)
      .single();

    // Emitir evento SSE
    orderEvents.emit({
      orderId: order.id,
      orderNumber: order.order_number,
      customerName: 'Cliente',
      status: order.status,
      total: order.total,
      items: itemsWithServerPrice.length,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ data: fullOrder ?? order }, { status: 201 });

  } catch (err) {
    console.error('[API/orders] Error:', err instanceof Error ? err.message : 'Unknown error');
    if (err instanceof Error && err.message.includes('Stock insuficiente')) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}