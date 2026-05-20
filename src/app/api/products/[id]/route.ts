import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { withAuth, isAdmin } from '@/lib/auth/helpers';
import { validateBody, productUpdateSchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, category_id, image_url, is_available, is_featured, stock_quantity, preparation_time_minutes, cost, low_stock_threshold, created_at, updated_at')
    .eq('id', params.id)
    .single();

  if (error) {
    if (error.code === 'PGR116') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('[API/products GET by id]', error.message);
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['manager_admin']);

  if ('error' in authResult) {
    return authResult.error;
  }

  const { success } = authResult;
  if (!isAdmin(success.role)) {
    return NextResponse.json({ error: 'Forbidden: Solo administradores pueden modificar productos' }, { status: 403 });
  }

  const validation = await validateBody(request, productUpdateSchema);
  if (!validation.success) {
    return validation.error;
  }

  const { data, error } = await success.supabase
    .from('products')
    .update(validation.data)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['manager_admin']);

  if ('error' in authResult) {
    return authResult.error;
  }

  const { success } = authResult;
  if (!isAdmin(success.role)) {
    return NextResponse.json({ error: 'Forbidden: Solo administradores pueden eliminar productos' }, { status: 403 });
  }

  const { error } = await success.supabase
    .from('products')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}