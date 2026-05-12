import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function createServerSupabaseClient(request?: NextRequest) {
  const cookieStore = cookies();
  const requestCookies = request?.headers.get('cookie') ?? '';
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        if (request) {
          const parsed = parseCookieHeader(requestCookies);
          return parsed.map(c => ({ name: c.name, value: c.value ?? '' }));
        }
        return cookieStore.getAll().map(c => ({ name: c.name, value: c.value ?? '' }));
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Handle errors when cookies can't be set
        }
      },
    },
  });
}

export function createServiceRoleClient() {
  const { createClient } = require('@supabase/supabase-js');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}