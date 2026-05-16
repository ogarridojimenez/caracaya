import type { Order, OrderItem } from '@/domain/types/database';

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

export interface CreateOrderInput {
  userId: string;
  items: { productId: string; productName: string; quantity: number; unitPrice: number; notes?: string }[];
  pickupTime: string;
  notes?: string;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrderAPIResponse {
  id: string;
  order_number: string;
  user_id: string | null;
  status: import('@/domain/types/database').OrderStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  notes: string | null;
  pickup_time: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  items?: OrderItem[];
  user?: { full_name: string | null };
  [key: string]: unknown;
}

export interface OrdersResponse {
  data: OrderAPIResponse[];
  pagination: PaginationInfo;
}

export async function getOrders(userId?: string, page = 1, limit = 10): Promise<OrdersResponse> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  const response = await fetchAPI(`/orders?${params.toString()}`);
  return response;
}

export async function getOrder(id: string) {
  const response = await fetchAPI(`/orders/${id}`);
  return response.data;
}

export async function createOrder(input: CreateOrderInput) {
  const response = await fetchAPI('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const response = await fetchAPI(`/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return response.data;
}

export async function getSalesSummary(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchAPI(`/orders/summary${query}`);
}

export async function getDailySales(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetchAPI(`/orders/daily${query}`);
  return response.data ?? [];
}