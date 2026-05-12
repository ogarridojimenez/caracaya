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
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

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