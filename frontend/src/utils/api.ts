/**
 * Central API Client for Pink City Exhibition for Electrical Appliances
 * (معرض المدينة الوردية للأجهزة الكهربائية)
 * 
 * Supports automatic client-side fallback to mock mode when the PostgreSQL 
 * database is not configured yet (missing DATABASE_URL in the workspace settings).
 */

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('pink_city_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Fallback configuration check
export function isMockModeActive(): boolean {
  return localStorage.getItem('pink_city_mock_active') === 'true' || !localStorage.getItem('pink_city_has_db_url');
}

export function setMockModeActive(active: boolean) {
  if (active) {
    localStorage.setItem('pink_city_mock_active', 'true');
  } else {
    localStorage.removeItem('pink_city_mock_active');
  }
}

// -------------------------------------------------------------
// LOCAL STORAGE MOCK DATA STORE
// -------------------------------------------------------------

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Default seed categories
const defaultCategories = [
  {
    id: 1,
    name: 'شاشات وتلفزيونات',
    imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 2,
    name: 'ثلاجات ومبردات',
    imageUrl: 'https://images.unsplash.com/photo-1571175432246-e3d9c76cc531?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 3,
    name: 'غسالات وجلايات',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 4,
    name: 'أجهزة المطبخ الصغيرة',
    imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&q=80&w=200',
  }
];

// Default seed products
const defaultProducts = [
  {
    id: 1,
    name: 'شاشة ال جي OLED 55 بوصة ذكية 4K',
    description: 'شاشة تلفزيون ال جي اوليد مذهلة بتجربة بصرية فائقة الوضوح، ألوان سينمائية سوداء نقية، وتقنيات الذكاء الاصطناعي مع تحديث 120 هرتز.',
    price: 589.0,
    sku: 'LG-OLED-55',
    barcode: '8806091234567',
    categoryId: 1,
    imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=600',
    quantity: 12,
    minQuantity: 3,
    location: 'الرف الرئيسي A1',
  },
  {
    id: 2,
    name: 'شاشة سامسونج Crystal UHD 65 بوصة 4K',
    description: 'تلفزيون سامسونج الذكي بدقة فور كي وتدرج لوني فائق نقاء المعالج كريستال، مع تصميم نحيف رائع ونظام تشغيل تايزن.',
    price: 399.0,
    sku: 'SAM-CRYST-65',
    barcode: '8806091234588',
    categoryId: 1,
    imageUrl: 'https://images.unsplash.com/photo-1601944179066-297acd3ad6d5?auto=format&fit=crop&q=80&w=600',
    quantity: 15,
    minQuantity: 4,
    location: 'الرف الرئيسي A2',
  },
  {
    id: 3,
    name: 'ثلاجة بيكو بابين 450 لتر نوفروست',
    description: 'ثلاجة بيكو كفاءة طاقة متقدمة بتقنية تبريد ثلاثي متطور يمنع الروائح ويحافظ على رطوبة الخضار والفواكه لفترة أطول.',
    price: 349.0,
    sku: 'BEKO-RF-450',
    barcode: '8690842234567',
    categoryId: 2,
    imageUrl: 'https://images.unsplash.com/photo-1571175432246-e3d9c76cc531?auto=format&fit=crop&q=80&w=600',
    quantity: 8,
    minQuantity: 2,
    location: 'صالة العرض الكبرى B1',
  },
  {
    id: 4,
    name: 'ثلاجة إل جي دولابي Side by Side 600 لتر',
    description: 'ثلاجة ال جي دولابي انفيرتر موفر للطاقة بتقنية تبريد دور كولينج لضمان حرارة مثالية ومتساوية في جميع الأجزاء.',
    price: 799.0,
    sku: 'LG-SIDE-600',
    barcode: '8806091234999',
    categoryId: 2,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600',
    quantity: 5,
    minQuantity: 1,
    location: 'صالة العرض الكبرى B2',
  },
  {
    id: 5,
    name: 'غسالة بوش 9 كيلو انفيرتر ألمانية',
    description: 'غسالة بوش الأوتوماتيكية مع محرك صامت فائق التحمل وتوفير فائق للمياه والكهرباء وبرامج غسيل متعددة الأغراض وسريعة.',
    price: 439.0,
    sku: 'BOSCH-WM-9KG',
    barcode: '4242005123456',
    categoryId: 3,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600',
    quantity: 10,
    minQuantity: 3,
    location: 'جناح الغسالات C1',
  },
  {
    id: 6,
    name: 'جلاية صحون سامسونج 12 فرد ستانلس',
    description: 'غسالة أطباق سامسونج بشاشة رقمية ورفوف مرنة ومستشعرات ذكية لتحديد حجم حمولة الأطباق وتوفير استهلاك الكهرباء.',
    price: 299.0,
    sku: 'SAM-DW-12P',
    barcode: '8806091234777',
    categoryId: 3,
    imageUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=600',
    quantity: 6,
    minQuantity: 2,
    location: 'جناح الغسالات C2',
  },
  {
    id: 7,
    name: 'قلاية فيليبس هوائية XXL حجم عائلي',
    description: 'مقلاة فيليبس بدون زيت بتقنية التبريد الهوائي السريع للقرمشة الفائقة مع دهون أقل بنسبة تصل إلى 90%. سعة كبيرة للعائلة.',
    price: 115.0,
    sku: 'PHIL-AF-XXL',
    barcode: '8710103123456',
    categoryId: 4,
    imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&q=80&w=600',
    quantity: 25,
    minQuantity: 5,
    location: 'جناح الأجهزة الصغيرة D1',
  },
  {
    id: 8,
    name: 'محضرة طعام براون مالتي كويك 7',
    description: 'خلاط يدوي براون بقدرة 1000 واط مع ملحقات متعددة لفرم اللحوم، خفق البيض، وتقطيع الخضراوات بمستويات سرعة ذكية.',
    price: 54.0,
    sku: 'BRAUN-MQ-7',
    barcode: '8021029123456',
    categoryId: 4,
    imageUrl: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&q=80&w=600',
    quantity: 30,
    minQuantity: 8,
    location: 'جناح الأجهزة الصغيرة D2',
  }
];

// Default users for mock environment
const defaultUsers = [
  {
    id: 1,
    name: 'إدارة معرض المدينة الوردية',
    email: 'admin@pinkcity.com',
    phone: '0791234567',
    role: 'admin'
  },
  {
    id: 2,
    name: 'يزن أبو خيط',
    email: 'yazan@pinkcity.com',
    phone: '0781234567',
    role: 'customer'
  },
  {
    id: 3,
    name: 'موظف المعرض',
    email: 'employee@pinkcity.com',
    phone: '0771234567',
    role: 'employee'
  }
];

// Initialise storage if empty
const initMockDB = () => {
  getStorageItem('pink_city_mock_categories', defaultCategories);
  getStorageItem('pink_city_mock_products', defaultProducts);
  getStorageItem('pink_city_mock_users', defaultUsers);
  getStorageItem('pink_city_mock_orders', []);
};
initMockDB();

// -------------------------------------------------------------
// CORE FETCH INTERCEPTOR & FALLBACK TRIGGER
// -------------------------------------------------------------

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> || {}),
  };

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json();

    // Mark that we succeeded connecting, so we know if database url is configured
    localStorage.setItem('pink_city_has_db_url', 'true');

    if (!response.ok) {
      // If server explicitly notifies that database is not configured
      if (data.isDbConfigMissing) {
        localStorage.setItem('pink_city_mock_active', 'true');
        localStorage.removeItem('pink_city_has_db_url');
        throw new Error('MOCK_FALLBACK');
      }
      throw new Error(data.message || 'حدث خطأ ما أثناء معالجة الطلب.');
    }

    return data;
  } catch (error: any) {
    // If database connection failed or database is unconfigured, fallback automatically to mock mode
    if (error.message === 'MOCK_FALLBACK' || error.message?.includes('Failed to fetch') || !localStorage.getItem('pink_city_has_db_url')) {
      localStorage.setItem('pink_city_mock_active', 'true');
      localStorage.removeItem('pink_city_has_db_url');
      return executeMockRoute<T>(endpoint, options);
    }
    throw error;
  }
}

// -------------------------------------------------------------
// CLIENT MOCK DATABASE ROUTER
// -------------------------------------------------------------

function executeMockRoute<T = any>(endpoint: string, options: RequestInit): T {
  const url = new URL(endpoint, window.location.origin);
  const path = url.pathname;
  const method = (options.method || 'GET').toUpperCase();
  const body = (options.body && typeof options.body === 'string') ? JSON.parse(options.body) : null;

  // Read current storage states
  const categories = getStorageItem<any[]>('pink_city_mock_categories', defaultCategories);
  const products = getStorageItem<any[]>('pink_city_mock_products', defaultProducts);
  const users = getStorageItem<any[]>('pink_city_mock_users', defaultUsers);
  const orders = getStorageItem<any[]>('pink_city_mock_orders', []);

  // Helper: check auth and extract mock user
  const getLoggedInUser = () => {
    const token = localStorage.getItem('pink_city_token');
    if (!token) return null;
    return getStorageItem<any>('pink_city_mock_user', null);
  };

  // --- 1. Authentication Routes ---
  if (path === '/api/auth/register' && method === 'POST') {
    const { email, name, phone, password } = body;
    if (users.find(u => u.email === email)) {
      throw new Error("البريد الإلكتروني هذا مستخدم بالفعل في النظام.");
    }
    const newUser = {
      id: Date.now(),
      name,
      email,
      phone,
      role: 'customer' as const
    };
    users.push(newUser);
    setStorageItem('pink_city_mock_users', users);
    
    localStorage.setItem('pink_city_token', 'mock-token-' + newUser.id);
    setStorageItem('pink_city_mock_user', newUser);
    return { success: true, user: newUser, token: 'mock-token-' + newUser.id } as unknown as T;
  }

  if (path === '/api/auth/login' && method === 'POST') {
    const { email, password, phone, loginMethod } = body;
    let user;
    if (loginMethod === 'phone' || phone) {
      user = users.find(u => u.phone === phone);
    } else {
      user = users.find(u => u.email === email);
    }

    if (!user) {
      // Create user on the fly if testing is easier
      user = {
        id: Date.now(),
        name: email ? email.split('@')[0] : 'عميل جديد',
        email: email || 'user@example.com',
        phone: phone || '0790000000',
        role: (email === 'admin@pinkcity.com' ? 'admin' : 'customer') as any
      };
      users.push(user);
      setStorageItem('pink_city_mock_users', users);
    }

    localStorage.setItem('pink_city_token', 'mock-token-' + user.id);
    setStorageItem('pink_city_mock_user', user);
    return { success: true, user, token: 'mock-token-' + user.id } as unknown as T;
  }

  if (path === '/api/auth/me' && method === 'GET') {
    const user = getLoggedInUser();
    if (!user) {
      throw new Error('غير مصرح بالدخول.');
    }
    return { success: true, user } as unknown as T;
  }

  // --- 2. Category Routes ---
  if (path === '/api/categories' && method === 'GET') {
    return { success: true, categories } as unknown as T;
  }

  if (path === '/api/categories' && method === 'POST') {
    const newCategory = {
      id: Date.now(),
      name: body.name,
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=200'
    };
    categories.push(newCategory);
    setStorageItem('pink_city_mock_categories', categories);
    return { success: true, category: newCategory } as unknown as T;
  }

  // --- 3. Product Routes ---
  if (path === '/api/products' && method === 'GET') {
    const categoryIdParam = url.searchParams.get('categoryId');
    const searchParam = url.searchParams.get('search');
    
    let filtered = [...products];
    if (categoryIdParam) {
      filtered = filtered.filter(p => p.categoryId === Number(categoryIdParam));
    }
    if (searchParam) {
      const q = searchParam.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) || 
        p.barcode?.includes(q)
      );
    }

    return { 
      success: true, 
      products: filtered,
      totalCount: filtered.length,
      totalPages: 1
    } as unknown as T;
  }

  if (path.startsWith('/api/products/') && method === 'GET') {
    const id = Number(path.split('/').pop());
    const prod = products.find(p => p.id === id);
    if (!prod) throw new Error('المنتج غير موجود.');
    return { success: true, product: prod } as unknown as T;
  }

  if (path.startsWith('/api/products/barcode/') && method === 'GET') {
    const barcode = path.split('/').pop();
    const prod = products.find(p => p.barcode === barcode);
    if (!prod) throw new Error('المنتج غير موجود بالباركود المدخل.');
    return { success: true, product: prod } as unknown as T;
  }

  if (path === '/api/products' && method === 'POST') {
    const { name, description, price, sku, barcode, categoryId, imageUrl, quantity, minQuantity, location } = body;
    if (products.find(p => p.sku === sku)) throw new Error('رمز SKU هذا مستخدم بالفعل.');
    if (barcode && products.find(p => p.barcode === barcode)) throw new Error('رمز الباركود هذا مستخدم بالفعل.');

    const newProduct = {
      id: Date.now(),
      name,
      description,
      price: Number(price),
      sku,
      barcode,
      categoryId: Number(categoryId),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=600',
      quantity: Number(quantity || 0),
      minQuantity: Number(minQuantity || 0),
      location
    };
    products.push(newProduct);
    setStorageItem('pink_city_mock_products', products);
    return { success: true, product: newProduct } as unknown as T;
  }

  if (path.startsWith('/api/products/') && method === 'PUT') {
    const id = Number(path.split('/').pop());
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('المنتج غير موجود لتعديله.');

    const updated = {
      ...products[index],
      ...body,
      price: body.price !== undefined ? Number(body.price) : products[index].price,
      categoryId: body.categoryId !== undefined ? Number(body.categoryId) : products[index].categoryId,
      quantity: body.quantity !== undefined ? Number(body.quantity) : products[index].quantity,
      minQuantity: body.minQuantity !== undefined ? Number(body.minQuantity) : products[index].minQuantity,
    };
    products[index] = updated;
    setStorageItem('pink_city_mock_products', products);
    return { success: true, product: updated } as unknown as T;
  }

  if (path.startsWith('/api/products/') && method === 'DELETE') {
    const id = Number(path.split('/').pop());
    const filtered = products.filter(p => p.id !== id);
    setStorageItem('pink_city_mock_products', filtered);
    return { success: true } as unknown as T;
  }

  // --- 4. Order Routes ---
  if (path === '/api/orders' && method === 'POST') {
    const user = getLoggedInUser();
    if (!user) throw new Error('يجب تسجيل الدخول لإتمام الطلب.');

    const { items, address, phone, notes } = body;
    
    // Calculate totals
    let computedTotalPrice = 0;
    const orderItems = items.map((item: any) => {
      const prod = products.find(p => p.id === Number(item.productId));
      if (!prod) throw new Error(`المنتج بالمعرف ${item.productId} غير متوفر.`);
      
      const subtotal = prod.price * Number(item.quantity);
      computedTotalPrice += subtotal;

      // Deduct quantity
      prod.quantity = Math.max(0, prod.quantity - Number(item.quantity));

      return {
        id: Date.now() + Math.random(),
        productId: prod.id,
        quantity: Number(item.quantity),
        price: prod.price,
        product: prod
      };
    });

    // Update products quantity in mock storage
    setStorageItem('pink_city_mock_products', products);

    const newOrder = {
      id: Math.floor(1000 + Math.random() * 9000),
      userId: user.id,
      totalPrice: computedTotalPrice,
      totalAmount: computedTotalPrice,
      status: 'pending',
      address,
      phone,
      notes,
      createdAt: new Date().toISOString(),
      user,
      items: orderItems
    };

    orders.unshift(newOrder);
    setStorageItem('pink_city_mock_orders', orders);

    // Clear cart locally
    localStorage.removeItem('pink_city_cart');

    return { success: true, order: newOrder } as unknown as T;
  }

  if (path === '/api/orders' && method === 'GET') {
    return { success: true, orders } as unknown as T;
  }

  if (path === '/api/users/me/orders' && method === 'GET') {
    const user = getLoggedInUser();
    if (!user) return { success: true, orders: [] } as unknown as T;
    const userOrders = orders.filter(o => o.userId === user.id);
    return { success: true, orders: userOrders } as unknown as T;
  }

  if (path.startsWith('/api/orders/') && path.endsWith('/status') && method === 'PUT') {
    const orderId = Number(path.split('/')[3]);
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error('الطلب غير موجود.');
    
    orders[index].status = body.status;
    setStorageItem('pink_city_mock_orders', orders);
    return { success: true, order: orders[index] } as unknown as T;
  }

  if (path.startsWith('/api/orders/') && method === 'GET') {
    const id = Number(path.split('/').pop());
    const ord = orders.find(o => o.id === id);
    if (!ord) throw new Error('الطلب غير موجود بالمعرف المدخل.');
    return { success: true, order: ord } as unknown as T;
  }

  throw new Error(`تعذر معالجة الطلب لعنوان المعاينة: ${path}`);
}

// -------------------------------------------------------------
// CENTRAL ROUTE IMPLEMENTATIONS
// -------------------------------------------------------------

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
