import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { OrderStatus } from '@/domain/types/database';
import { validateBody, orderStatusUpdateSchema } from '@/lib/validations';

interface Order {
  user_id: string | null;
  status: OrderStatus;
  completed_at?: string;
}

interface UpdateBody {
  status: OrderStatus;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('user_id')
    .eq('id', params.id)
    .single();

  if (orderError) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const isStaff = userData?.role === 'vendedor' || userData?.role === 'manager_admin';
  const isOwner = order.user_id === user.id;

  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(id, product_id, product_name, quantity, unit_price, total_price, notes, product:products(id, name, image_url)), user:users(id, full_name, email)')
    .eq('id', params.id)
    .single();

  if (error) {
    console.error('[API/orders GET by id]', error.message);
    return NextResponse.json({ error: 'Error al obtener pedido' }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const { data: order } = await supabase
    .from('orders')
    .select('user_id, status')
    .eq('id', params.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const validation = await validateBody(request, orderStatusUpdateSchema);
  if (!validation.success) {
    return validation.error;
  }

  const { status } = validation.data;

  const isStaff = userData?.role === 'vendedor' || userData?.role === 'manager_admin';
  const isOwner = order.user_id === user.id;

  if (status === 'cancelled') {
    if (!isStaff && !isOwner) {
      return NextResponse.json({ error: 'No puedes cancelar este pedido' }, { status: 403 });
    }
    if (!isStaff && order.status !== 'pending') {
      return NextResponse.json({ error: 'Solo se pueden cancelar pedidos pendientes' }, { status: 400 });
    }
  } else if (!isStaff) {
    return NextResponse.json({ error: 'Solo el staff puede cambiar el estado del pedido' }, { status: 403 });
  }

  const updates: Partial<Order> = { status };

  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}