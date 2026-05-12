const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

export interface DailyCloseItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface DailyClose {
  id: string;
  user_id: string;
  close_date: string;
  total_amount: number;
  subtotal: number;
  notes: string | null;
  created_at: string;
  user?: { id: string; full_name: string };
  items?: DailyCloseItem[];
}

export async function getDailyCloses() {
  const response = await fetchAPI('/daily-closes');
  return response.data ?? [];
}

export async function createDailyClose(closeDate: string, items: DailyCloseItem[], notes?: string) {
  const response = await fetchAPI('/daily-closes', {
    method: 'POST',
    body: JSON.stringify({ closeDate, items, notes }),
  });
  return response.data;
}