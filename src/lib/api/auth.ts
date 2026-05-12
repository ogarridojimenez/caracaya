const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(error.error);
  }

  return res.json();
}

export async function register(email: string, password: string, fullName: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Registration failed' }));
    throw new Error(error.error);
  }

  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Logout failed');
}

export async function getCurrentUser(): Promise<{ user: any } | null> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: 'include',
  });

  if (!res.ok) return null;
  return res.json();
}