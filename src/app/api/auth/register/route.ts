import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);
    const body = await request.json();
    const { email, password, fullName } = body;

    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Este correo ya está registrado. Usa iniciar sesión.' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json({ error: 'Este correo ya está registrado. Usa iniciar sesión.' }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user) {
      await supabase.from('users').upsert({
        id: data.user.id,
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
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}