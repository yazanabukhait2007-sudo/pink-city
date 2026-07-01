/**
 * Central API Client for Pink City Exhibition for Electrical Appliances
 * (معرض المدينة الوردية للأجهزة الكهربائية)
 */

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('pink_city_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'حدث خطأ ما أثناء معالجة الطلب.');
  }

  return data;
}

// Authentication API methods
export const authApi = {
  register: (body: any) => apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => apiFetch('/api/auth/me'),
};

// Categories API methods
export const categoriesApi = {
  list: () => apiFetch('/api/categories'),
  create: (body: any) => apiFetch('/api/categories', { method: 'POST', body: JSON.stringify(body) }),
};

// Products API methods
export const productsApi = {
  list: (params: { categoryId?: number | string; search?: string; page?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.categoryId) query.append('categoryId', String(params.categoryId));
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', String(params.page));
    
    const queryString = query.toString();
    return apiFetch(`/api/products${queryString ? `?${queryString}` : ''}`);
  },
  get: (id: number | string) => apiFetch(`/api/products/${id}`),
  getByBarcode: (code: string) => apiFetch(`/api/products/barcode/${code}`),
  create: (body: any) => apiFetch('/api/products', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number | string, body: any) => apiFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number | string) => apiFetch(`/api/products/${id}`, { method: 'DELETE' }),
};

// Orders API methods
export const ordersApi = {
  create: (body: { items: Array<{ productId: number; quantity: number }>; address: string; phone: string; notes?: string }) => 
    apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  list: () => apiFetch('/api/orders'),
  get: (id: number | string) => apiFetch(`/api/orders/${id}`),
  updateStatus: (id: number | string, status: string) => apiFetch(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  myOrders: () => apiFetch('/api/users/me/orders'),
};
