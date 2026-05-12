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

export async function getProducts() {
  const response = await fetchAPI('/products');
  return response.data ?? [];
}

export async function getProduct(id: string) {
  const response = await fetchAPI(`/products/${id}`);
  return response.data;
}

export async function createProduct(product: Partial<any>) {
  const response = await fetchAPI('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
  return response.data;
}

export async function updateProduct(id: string, product: Partial<any>) {
  const response = await fetchAPI(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(product),
  });
  return response.data;
}

export async function deleteProduct(id: string) {
  return fetchAPI(`/products/${id}`, {
    method: 'DELETE',
  });
}

export async function uploadProductImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}