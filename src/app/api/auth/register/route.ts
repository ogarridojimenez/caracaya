import { NextResponse, NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createServiceRoleClient();
  const { email, password, fullName } = await request.json();

  const { data: authData, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (authData.user) {
    await supabase.from('users').upsert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role: 'cliente',
    }, { onConflict: 'id' });

    return NextResponse.json({ 
      success: true,
      message: 'Cuenta creada exitosamente. Ahora puedes iniciar sesión.'
    }, { status: 201 });
  }

  return NextResponse.json({ success: false, error: 'Error al crear usuario' }, { status: 400 });
}