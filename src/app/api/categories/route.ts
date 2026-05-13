import { NextResponse, NextRequest } from 'next/server';
import { withAuth, isAdmin } from '@/lib/auth/helpers';

export async function GET(request: NextRequest) {
  const auth = await withAuth(request);
  if ('error' in auth) return auth.error;

  const { supabase, role } = auth.success;
  const adminMode = isAdmin(role);

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order(adminMode ? 'sort_order' : 'name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!adminMode) {
    return NextResponse.json({ data: data?.filter(c => c.is_active) ?? [] });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ['manager_admin']);
  if ('error' in auth) return auth.error;

  const body = await request.json();

  if (body.orders && Array.isArray(body.orders)) {
    const { supabase } = auth.success;
    const updates = body.orders.map(({ id, sort_order }: { id: string; sort_order: number }) =>
      supabase.from('categories').update({ sort_order }).eq('id', id)
    );
    const results = await Promise.all(updates);
    const hasError = results.some(r => r.error);
    if (hasError) return NextResponse.json({ error: 'Error updating order' }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const { supabase } = auth.success;
  const { data, error } = await supabase
    .from('categories')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}