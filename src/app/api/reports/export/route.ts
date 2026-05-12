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
  const startDate = searchParams.get('start_date') || new Date(new Date().setDate(1)).toISOString().split('T')[0];
  const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0];

  const { data: orders, error } = await supabase
    .from('orders')
    .select('order_number, status, subtotal, tax_amount, discount_amount, total, notes, pickup_time, created_at, user:users(full_name)')
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csvHeader = 'Fecha,Hora,Pedido,Cliente,Estado,Subtotal,Impuesto,Descuento,Total\n';
  const csvRows = orders?.map(order => {
    const date = new Date(order.created_at);
    return [
      date.toLocaleDateString('es-ES'),
      date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      order.order_number,
      (order.user as any)?.full_name || 'Cliente',
      order.status,
      order.subtotal?.toFixed(2) || '0.00',
      order.tax_amount?.toFixed(2) || '0.00',
      order.discount_amount?.toFixed(2) || '0.00',
      order.total?.toFixed(2) || '0.00',
    ].join(',');
  }).join('\n');

  const csv = csvHeader + csvRows;
  
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pedidos_${startDate}_${endDate}.csv"`,
    },
  });
}