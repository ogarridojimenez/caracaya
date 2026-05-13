import { NextResponse, NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const body = await request.json();
    const { email, password, fullName } = body;

    console.log('[REGISTER] Attempting to create user:', email);

    const { data: authData, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    console.log('[REGISTER] Auth result:', { error, userId: authData?.user?.id });

    if (error) {
      console.log('[REGISTER] Auth error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (authData.user) {
      const { error: dbError } = await supabase.from('users').upsert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role: 'cliente',
      }, { onConflict: 'id' });

      console.log('[REGISTER] DB upsert result:', { dbError });

      return NextResponse.json({
        success: true,
        message: 'Cuenta creada exitosamente. Ahora puedes iniciar sesión.'
      }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: 'Error al crear usuario' }, { status: 400 });
  } catch (err) {
    console.error('[REGISTER] Unexpected error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}