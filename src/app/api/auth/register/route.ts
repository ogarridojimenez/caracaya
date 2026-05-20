import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { validateBody, z } from '@/lib/validations';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  fullName: z.string().min(1, 'El nombre es requerido').max(100),
  phone: z.string().max(20).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const validation = await validateBody(request, registerSchema);
    if (!validation.success) {
      return validation.error;
    }

    const { email, password, fullName, phone } = validation.data;
    const supabase = createServerSupabaseClient(request);

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
      console.error('[API/auth/register] Supabase error:', error.message);
      return NextResponse.json({ error: 'Error al crear la cuenta. Intenta de nuevo.' }, { status: 400 });
    }

    if (data.user) {
      await supabase.from('users').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        phone: phone || null,
        role: 'cliente',
      }, { onConflict: 'id' });

      return NextResponse.json({
        success: true,
        message: 'Cuenta creada exitosamente. Ahora puedes iniciar sesión.'
      }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: 'Error al crear usuario' }, { status: 400 });
  } catch (err) {
    console.error('[API/auth/register] Error:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}