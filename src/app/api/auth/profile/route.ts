import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { data } = await supabase
    .from('users')
    .select('id, email, full_name, role, avatar_url, created_at')
    .eq('id', user.id)
    .single();

  return NextResponse.json({ user: data });
}

export async function PATCH(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const body = await request.json();
  const { full_name, avatar_url, current_password, new_password } = body;

  const updates: Record<string, any> = {};
  if (full_name !== undefined) updates.full_name = full_name;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  if (Object.keys(updates).length > 0) {
    await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);
  }

  if (current_password && new_password) {
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email ?? '',
      password: current_password,
    });

    if (error) {
      return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 400 });
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password,
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }
  }

  const { data } = await supabase
    .from('users')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .single();

  return NextResponse.json({ user: data });
}