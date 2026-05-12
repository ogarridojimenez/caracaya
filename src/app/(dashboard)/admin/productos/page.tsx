'use client';

import { ProductsTable } from '@/features/products/components/ProductsTable';

export default function AdminProductosPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
        <p className="text-sm text-gray-500">Administra el catálogo de productos</p>
      </div>
      <ProductsTable />
    </div>
  );
}