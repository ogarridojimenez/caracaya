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

export async function getCategories() {
  const response = await fetchAPI('/categories');
  return response.data ?? [];
}

export async function createCategory(category: Partial<any>) {
  const response = await fetchAPI('/categories', {
    method: 'POST',
    body: JSON.stringify(category),
  });
  return response.data;
}

export async function updateCategory(id: string, category: Partial<any>) {
  const response = await fetchAPI(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(category),
  });
  return response.data;
}

export async function deleteCategory(id: string) {
  return fetchAPI(`/categories/${id}`, {
    method: 'DELETE',
  });
}