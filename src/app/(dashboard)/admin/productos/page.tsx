'use client';

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { useProducts } from '@/features/products/hooks';
import { ImageUpload } from '@/components/image-upload';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
  created_at: string;
}

const categories = ['Bebidas', 'Comidas', 'Postres', 'Snacks', 'Combos'];

export default function AdminProductosPage() {
  const { data: products, isLoading } = useProducts();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: categories[0], image_url: '', is_available: true });

  const filtered = (products ?? []).filter((p: Product) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    const method = editing ? 'PATCH' : 'POST';
    const url = editing ? `/api/products/${editing.id}` : '/api/products';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    });
    if (res.ok) {
      setEditing(null);
      setShowCreate(false);
      setForm({ name: '', description: '', price: '', category: categories[0], image_url: '', is_available: true });
      window.location.reload();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'include' });
    window.location.reload();
  };

  const handleEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, image_url: p.image_url ?? '', is_available: p.is_available });
    setShowCreate(true);
  };

  const isOpen = showCreate || editing !== null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Productos</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{(products ?? []).length} productos en el catálogo</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setEditing(null); setForm({ name: '', description: '', price: '', category: categories[0], image_url: '', is_available: true }); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#d97706', color: '#fff', borderRadius: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}
        >
          <Plus size={16} />
          Nuevo Producto
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Buscar por nombre o categoría..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Cargando...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No se encontraron productos</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Imagen</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Nombre</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Categoría</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Precio</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Estado</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: Product) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '0.5rem' }} />
                    ) : (
                      <div style={{ width: 48, height: 48, background: '#f3f4f6', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={20} color="#9ca3af" />
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{p.description}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.875rem' }}>{p.category}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>${p.price.toFixed(2)}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: p.is_available ? '#dcfce7' : '#fee2e2', color: p.is_available ? '#16a34a' : '#dc2626' }}>
                      {p.is_available ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(p)} style={{ padding: '0.25rem', color: '#9ca3af', borderRadius: '0.25rem', cursor: 'pointer' }} title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} style={{ padding: '0.25rem', color: '#ef4444', borderRadius: '0.25rem', cursor: 'pointer' }} title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', width: '100%', maxWidth: '500px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{editing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => { setEditing(null); setShowCreate(false); }} style={{ color: '#9ca3af', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Nombre *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.5rem', fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Descripción</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.5rem', fontSize: '0.875rem', minHeight: 60 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Precio *</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.5rem', fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Categoría</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.5rem', fontSize: '0.875rem' }}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Imagen del Producto</label>
                <ImageUpload value={form.image_url} onChange={(url) => setForm(f => ({ ...f, image_url: url }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="available" checked={form.is_available} onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))} />
                <label htmlFor="available" style={{ fontSize: '0.875rem', color: '#374151' }}>Producto disponible</label>
              </div>
              <button onClick={handleSave} style={{ padding: '0.5rem', background: '#d97706', color: '#fff', borderRadius: '0.5rem', fontWeight: 500 }}>
                {editing ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}