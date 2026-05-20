import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/helpers';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { z } from 'zod';

const adminCreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(1, 'El nombre es requerido').max(100),
  role: z.enum(['cliente', 'vendedor', 'manager_admin']).optional().default('cliente'),
});

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ['manager_admin']);
  if ('error' in auth) return auth.error;

  const { supabase } = auth.success;

  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, role, phone, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[API/auth/users GET]', error.message);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ['manager_admin']);
  if ('error' in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
  }

  const parsed = adminCreateUserSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return NextResponse.json({ error: `Validación fallida: ${message}` }, { status: 400 });
  }

  const { email, password, name, role } = parsed.data;
  const adminSupabase = createServiceRoleClient();

  const { data, error } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, role },
  });

  if (error) {
    console.error('[API/auth/users POST]', error.message);
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
  }

  return NextResponse.json({ data });
}