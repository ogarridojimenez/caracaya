import { ProductsTable } from '@/features/products';

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Gestión de Productos
        </h1>
        <ProductsTable />
      </div>
    </main>
  );
}
