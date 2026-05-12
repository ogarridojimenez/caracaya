'use client';

import { useState } from 'react';
import { useProducts, useCategories } from '../hooks';
import { ProductFormModal } from './ProductFormModal';
import { confirmService } from '@/components/ui/molecules';
import toast from 'react-hot-toast';
import { useDeleteProduct } from '../hooks';
import type { Product } from '@/domain/types/database';

export function ProductsTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data, isLoading, error } = useProducts();
  const { data: categories } = useCategories();
  const deleteMutation = useDeleteProduct();

  const handleDelete = (product: Product) => {
    confirmService.delete(async () => {
      try {
        await deleteMutation.mutateAsync(product.id);
        toast.success(`Producto "${product.name}" eliminado`);
      } catch {
        toast.error('Error al eliminar el producto');
      }
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  if (error) {
    return <div className="text-red-600 p-4">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Productos</h2>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Nuevo
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : data?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No hay productos</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Precio</th>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3 text-left">Disponible</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((product: Product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{product.name}</td>
                  <td className="p-3">${product.price.toFixed(2)}</td>
                  <td className="p-3">{product.stock_quantity}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${product.is_available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {product.is_available ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={editingProduct}
      />
    </div>
  );
}