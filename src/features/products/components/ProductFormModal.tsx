'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCategories, useCreateProduct, useUpdateProduct } from '../hooks';
import * as productsApi from '@/lib/api/products';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import type { Product, Category } from '@/domain/types/database';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  category_id: string;
  stock_quantity: string;
  is_available: boolean;
}

export function ProductFormModal({ isOpen, onClose, product }: ProductFormModalProps) {
  const { data: categories } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock_quantity: '',
    is_available: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description ?? '',
        price: String(product.price),
        category_id: product.category_id,
        stock_quantity: String(product.stock_quantity),
        is_available: product.is_available,
      });
      setImagePreview(product.image_url ?? null);
    } else {
      setFormData({ name: '', description: '', price: '', category_id: '', stock_quantity: '', is_available: true });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category_id) {
      toast.error('Completa los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = product?.image_url ?? null;

      if (imageFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', imageFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
          credentials: 'include',
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
        }
      }

      const data = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_available: formData.is_available,
        image_url: imageUrl,
        is_featured: false,
      };

      if (product) {
        await updateMutation.mutateAsync({ id: product.id, product: data });
        toast.success('Producto actualizado');
      } else {
        await createMutation.mutateAsync(data as any);
        toast.success('Producto creado');
      }
      onClose();
    } catch (err) {
      toast.error('Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">{product ? 'Editar' : 'Nuevo'} Producto</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nombre *</label>
            <input name="name" value={formData.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>

          <div>
            <label className="block text-sm font-medium">Descripción</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Precio *</label>
              <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Stock</label>
              <input name="stock_quantity" type="number" value={formData.stock_quantity} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Categoría *</label>
            <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
              <option value="">Seleccionar...</option>
              {categories?.map((cat: Category) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Imagen</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
            {imagePreview && <Image src={imagePreview} alt="Preview" width={80} height={80} className="mt-2 h-20 rounded object-cover" />}
          </div>

          <label className="flex items-center gap-2">
            <input name="is_available" type="checkbox" checked={formData.is_available} onChange={handleChange} />
            <span className="text-sm">Disponible</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}