import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

interface UpdateBody {
  role?: string;
  full_name?: string;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (currentUser?.role !== 'manager_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body: UpdateBody = await request.json();
  const { role, full_name } = body;

  const ALLOWED_ROLES = ['cliente', 'vendedor', 'manager_admin'] as const;

  if (role && !ALLOWED_ROLES.includes(role as typeof ALLOWED_ROLES[number])) {
    return NextResponse.json({ error: `Rol inválido. Debe ser: ${ALLOWED_ROLES.join(', ')}` }, { status: 400 });
  }

  const isSelfModification = params.id === user.id;
  if (isSelfModification && role && role !== 'manager_admin') {
    return NextResponse.json({ error: 'No puedes degradar tu propio rol de administrador' }, { status: 400 });
  }

  const updateData: Record<string, string> = {};
  if (role) updateData.role = role;
  if (full_name) updateData.full_name = full_name;

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    console.error('[API/auth/users PATCH]', error.message);
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (currentUser?.role !== 'manager_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (params.id === user.id) {
    return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 });
  }

  const adminSupabase = createServiceRoleClient();
  const { error } = await adminSupabase.auth.admin.deleteUser(params.id);

  if (error) {
    console.error('[API/auth/users DELETE]', error.message);
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}