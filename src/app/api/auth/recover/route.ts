import { createServerSupabaseClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://cafeteria.vercel.app',
];

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return Response.json({ error: 'Email requerido' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const headersList = headers();
  const origin = headersList.get('origin') || '';

  let redirectUrl = '/reset-password';
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    redirectUrl = `${origin}/api/auth/callback?next=/reset-password`;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ message: 'Correo de recuperación enviado' });
}