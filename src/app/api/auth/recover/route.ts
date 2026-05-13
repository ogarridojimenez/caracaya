import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return Response.json({ error: 'Email requerido' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${req.headers.get('origin')}/api/auth/callback?next=/reset-password`,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ message: 'Correo de recuperación enviado' });
}