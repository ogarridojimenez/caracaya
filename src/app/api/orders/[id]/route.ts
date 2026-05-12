import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(*)), user:users(*)')
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  const body = await request.json();
  const { status } = body;
  
  const isStaff = userData?.role === 'vendedor' || userData?.role === 'manager_admin';
  const isOwner = order.user_id === user.id;
  
  if (status === 'cancelled' && !isStaff) {
    if (!isOwner) {
      return NextResponse.json({ error: 'No puedes cancelar este pedido' }, { status: 403 });
    }
    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Solo se pueden cancelar pedidos pendientes' }, { status: 400 });
    }
  }
  
  const updates: any = { status };
  
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