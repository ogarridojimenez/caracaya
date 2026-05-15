import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type UserRole = 'cliente' | 'vendedor' | 'manager_admin';

interface AuthResult {
  userId: string;
  role: UserRole;
  supabase: ReturnType<typeof createServerSupabaseClient>;
}

export async function withAuth(
  request: NextRequest,
  requiredRoles?: UserRole[]
): Promise<{ error: NextResponse } | { success: AuthResult }> {
  const supabase = createServerSupabaseClient(request);
  
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error: any) {
    console.error('[withAuth] Auth error:', error?.message ?? 'Unknown');
    const errorCode = error?.__authError?.code ?? error?.code ?? '';
    if (errorCode === 'refresh_token_not_found' || errorCode === 'invalid_refresh_token') {
      return { error: NextResponse.json({ error: 'Sesión expirada. Por favor, inicia sesión nuevamente.' }, { status: 401 }) };
    }
  }

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = (userData?.role ?? 'cliente') as UserRole;

  if (requiredRoles && !requiredRoles.includes(role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { success: { userId: user.id, role, supabase } };
}

export function isStaff(role: string): boolean {
  return role === 'vendedor' || role === 'manager_admin';
}

export function isAdmin(role: string): boolean {
  return role === 'manager_admin';
}

export type { UserRole };