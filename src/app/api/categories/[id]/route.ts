import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/helpers';
import { validateBody, categoryUpdateSchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await withAuth(request);
  if ('error' in auth) return auth.error;

  const { supabase } = auth.success;

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, image_url, sort_order, is_active, created_at, updated_at')
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await withAuth(request, ['manager_admin']);
  if ('error' in auth) return auth.error;

  const validation = await validateBody(request, categoryUpdateSchema);
  if (!validation.success) {
    return validation.error;
  }

  const { supabase } = auth.success;

  const { data, error } = await supabase
    .from('categories')
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
  const auth = await withAuth(request, ['manager_admin']);
  if ('error' in auth) return auth.error;

  const { supabase } = auth.success;

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}