import React, { useState, useEffect } from 'react';
import { productsApi, categoriesApi } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Search, RotateCcw, SlidersHorizontal, ArrowLeft, ArrowRight, Grid, Filter } from 'lucide-react';

interface ProductsProps {
  initialCategoryId?: number | null;
  onNavigate: (view: string, params?: any) => void;
}

export const Products: React.FC<ProductsProps> = ({ initialCategoryId = null, onNavigate }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | string>(initialCategoryId || '');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 20
  });

  // Load categories once on mount
  useEffect(() => {
    async function fetchCats() {
      try {
        const res = await categoriesApi.list();
        if (res.success) {
          setCategories(res.categories || []);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }
    fetchCats();
  }, []);

  // Fetch products whenever filters or pages change
  useEffect(() => {
    async function fetchProds() {
      try {
        setLoading(true);
        const res = await productsApi.list({
          categoryId: selectedCategory || undefined,
          search: search || undefined,
          page
        });
        if (res.success) {
          setProducts(res.products || []);
          if (res.pagination) {
            setPagination(res.pagination);
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProds();
  }, [selectedCategory, search, page]);

  const handleReset = () => {
    setSearch('');
    setSelectedCategory('');
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <div className="text-right">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">كتالوج الأجهزة الكهربائية</h1>
        <p className="text-sm text-gray-500 mt-1">تصفح واكتشف تشكيلتنا الغنية والمكفولة من الأجهزة المنزلية.</p>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search box */}
          <div className="md:col-span-7 relative">
            <input
              type="text"
              placeholder="ابحث باسم الجهاز أو الموديل أو الوصف..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // reset to first page on search
              }}
              className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-gray-100 hover:border-gray-200 focus:border-brand-primary focus:bg-white focus:outline-none rounded-xl text-sm transition-all text-right font-medium"
            />
            <Search className="absolute right-4 top-3.5 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Category drop down */}
          <div className="md:col-span-3 relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1); // reset to first page on select
              }}
              className="w-full px-4 py-3 bg-slate-50 border border-gray-100 hover:border-gray-200 focus:border-brand-primary focus:bg-white focus:outline-none rounded-xl text-sm transition-all appearance-none font-semibold text-gray-700"
            >
              <option value="">جميع التصنيفات</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Filter className="absolute left-4 top-3.5 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Reset Filters button */}
          <div className="md:col-span-2">
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 hover:border-brand-primary/20 text-gray-600 hover:text-brand-primary font-bold rounded-xl text-sm transition-all bg-white hover:bg-brand-secondary/10"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة تهيئة</span>
            </button>
          </div>
        </div>

        {/* Categories Fast Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-50">
          <span className="text-xs text-gray-400 ml-2 font-bold flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            التصنيف السريع:
          </span>
          <button
            onClick={() => {
              setSelectedCategory('');
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === ''
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            الكل
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                Number(selectedCategory) === cat.id
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-2xl h-80 shadow-sm" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onViewDetails={(id) => onNavigate('product_details', { id })}
              />
            ))}
          </div>

          {/* Simple Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-gray-100">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold transition-all ${
                  page <= 1
                    ? 'opacity-40 cursor-not-allowed text-gray-400 bg-gray-50'
                    : 'bg-white text-gray-700 hover:border-brand-primary hover:text-brand-primary'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              <span className="text-sm font-extrabold text-gray-700 bg-white border border-gray-100 px-4 py-2 rounded-xl">
                صفحة {page} من {pagination.totalPages}
              </span>

              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className={`flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold transition-all ${
                  page >= pagination.totalPages
                    ? 'opacity-40 cursor-not-allowed text-gray-400 bg-gray-50'
                    : 'bg-white text-gray-700 hover:border-brand-primary hover:text-brand-primary'
                }`}
              >
                <span>التالي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 max-w-lg mx-auto">
          <Grid className="w-14 h-14 text-gray-200 mx-auto mb-4 stroke-[1.2]" />
          <h3 className="font-extrabold text-gray-700 text-lg mb-1">لا توجد أجهزة مطابقة</h3>
          <p className="text-sm px-6">
            عذراً، لم نجد أي أجهزة تطابق معايير البحث والفلترة حالياً. جرب إعادة تهيئة الخيارات أو كتابة مصطلح بحث آخر.
          </p>
          <button
            onClick={handleReset}
            className="mt-6 px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-brand-primary/15"
          >
            عرض كافة الأجهزة
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;
