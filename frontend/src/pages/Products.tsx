import React, { useEffect, useState } from 'react';
import { productsApi, categoriesApi } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Search, Filter, RefreshCw, Barcode, Grid, AlertCircle } from 'lucide-react';

interface ProductsProps {
  onNavigate: (view: string, params?: any) => void;
  initialFilters?: { categoryId?: number };
}

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  barcode?: string;
  categoryId: number;
  imageUrl: string;
  quantity: number;
  minQuantity: number;
  location?: string;
}

export const Products: React.FC<ProductsProps> = ({ onNavigate, initialFilters }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>(
    initialFilters?.categoryId || 'all'
  );
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [barcodeSearchActive, setBarcodeSearchActive] = useState(false);

  useEffect(() => {
    // Sync initial filters if they change from external navigation (like category clicks on Home)
    if (initialFilters?.categoryId) {
      setSelectedCategory(initialFilters.categoryId);
    }
  }, [initialFilters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        productsApi.list(),
        categoriesApi.list(),
      ]);

      if (pRes.success && pRes.products) {
        setProducts(pRes.products);
      }
      if (cRes.success && cRes.categories) {
        setCategories(cRes.categories);
      }
    } catch (err) {
      console.error('Failed to load products/categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBarcodeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeQuery.trim()) return;

    setLoading(true);
    setBarcodeSearchActive(true);
    try {
      const res = await productsApi.getByBarcode(barcodeQuery.trim());
      if (res.success && res.product) {
        setProducts([res.product]);
        // Navigate to details of that product
        onNavigate('product-details', { productId: res.product.id });
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to search by barcode:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const clearBarcodeSearch = () => {
    setBarcodeQuery('');
    setBarcodeSearchActive(false);
    loadData();
  };

  // Filter products client-side for dynamic reactivity
  const filteredProducts = products.filter((product) => {
    // Filter by Category
    if (selectedCategory !== 'all' && product.categoryId !== selectedCategory) {
      return false;
    }
    
    // Filter by Search Query (Name, Description, SKU, Barcode)
    const query = searchQuery.toLowerCase();
    if (query) {
      const matchesName = product.name.toLowerCase().includes(query);
      const matchesDesc = product.description.toLowerCase().includes(query);
      const matchesSku = product.sku.toLowerCase().includes(query);
      const matchesBarcode = product.barcode?.toLowerCase().includes(query) || false;
      return matchesName || matchesDesc || matchesSku || matchesBarcode;
    }

    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in" style={{ direction: 'rtl' }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="text-right">
          <h1 className="text-2xl font-black text-gray-900 mb-1">معرض الأجهزة الكهربائية</h1>
          <p className="text-sm text-gray-500 font-medium">استكشف الأجهزة المتوفرة ومواقعها التفصيلية في المعرض الرئيسي</p>
        </div>

        {/* Barcode Quick Scan form (great for physical store use) */}
        <form onSubmit={handleBarcodeSearch} className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-grow">
            <Barcode className="absolute right-3.5 top-3 w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="ابحث بقراءة الباركود للقطعة..."
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value)}
              className="w-full pl-4 pr-11 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:outline-none"
            />
          </div>
          {barcodeSearchActive ? (
            <button
              type="button"
              onClick={clearBarcodeSearch}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-bold rounded-xl transition-all"
            >
              إلغاء
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md"
            >
              <span>بحث</span>
            </button>
          )}
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Side: Sidebar Filters */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
              <Filter className="w-4 h-4 text-pink-500" />
              <span>تصفية المنتجات</span>
            </h3>

            {/* General Text Search */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 text-right">بحث بالاسم أو الموديل</label>
              <div className="relative">
                <Search className="absolute right-3.5 top-3 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="مثال: شاشة سامسونج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Categories filter list */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 text-right">الأقسام الرئيسية</label>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-right px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-pink-50 text-pink-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  الكل
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-pink-50 text-pink-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Reset Button */}
            {(searchQuery || selectedCategory !== 'all' || barcodeSearchActive) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  clearBarcodeSearch();
                }}
                className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-100"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة ضبط الفلاتر</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Products Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-white border border-gray-50 rounded-2xl h-[380px]" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={(id) => onNavigate('product-details', { productId: id })}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center flex flex-col items-center max-w-lg mx-auto">
              <div className="p-4 bg-slate-50 text-gray-400 rounded-full mb-4">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-lg mb-1">لم نعثر على أجهزة تطابق بحثك</h3>
              <p className="text-gray-500 text-sm max-w-sm mt-1 mb-6 leading-relaxed">
                تأكد من كتابة اسم الجهاز بشكل صحيح أو تصفح الأقسام الأخرى من الفلاتر الجانبية.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  clearBarcodeSearch();
                }}
                className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all"
              >
                عرض كل المنتجات
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
