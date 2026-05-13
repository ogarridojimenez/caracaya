import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ received: true, orders: body.orders });
  } catch {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }
}

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userProfile?.role !== 'manager_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { orders } = await request.json();

    if (!Array.isArray(orders)) {
      return NextResponse.json({ error: 'Invalid orders' }, { status: 400 });
    }

    const updates = orders.map(({ id, sort_order }: { id: string; sort_order: number }) =>
      supabase.from('categories').update({ sort_order }).eq('id', id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some(r => r.error);

    if (hasError) {
      return NextResponse.json({ error: 'Error updating order' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}