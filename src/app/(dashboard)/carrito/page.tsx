'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useProducts } from '@/features/products/hooks';
import { useCategories } from '@/features/products/hooks/use-categories';
import { AddToCartButton } from '@/features/orders/components';
import { ShoppingBag, Search } from 'lucide-react';
import { useCartStore } from '@/store';
import type { Product, Category } from '@/domain/types/database';
import { SkeletonProductCard } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';

export default function CarritoPage() {
  const [mounted, setMounted] = useState(false);
  const { _hasHydrated } = useCartStore();
  const { data, isLoading, error } = useProducts();
  const { data: categories } = useCategories();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setMounted(true);
  }, []);

  const products = data ?? [];
  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) => {
      const matchesSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
      return matchesSearch && matchesCategory && p.is_available;
    });
  }, [products, debouncedSearch, selectedCategory]);

  if (!mounted) {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Menú</h1>
          <div className="h-10 bg-gray-200 rounded mt-4 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="h-40 bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Menú</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 py-12">Error al cargar productos</div>;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menú</h1>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
            <label htmlFor="search-products" className="sr-only">Buscar productos</label>
            <input
              id="search-products"
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              aria-label="Buscar productos"
            />
          </div>
          {categories && categories.length > 0 && (
            <div className="flex gap-2 flex-wrap" role="group" aria-label="Filtrar por categoría">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  !selectedCategory
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {categories.map((cat: Category) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No se encontraron productos</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product: Product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {product.image_url ? (
                <div className="relative h-40 w-full">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                  <ShoppingBag className="h-12 w-12 text-gray-300" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-amber-600">${product.price.toFixed(2)}</span>
                  <AddToCartButton product={product} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
