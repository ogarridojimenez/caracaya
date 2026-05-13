'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Image as ImageIcon, GripVertical } from 'lucide-react';
import { ImageUpload } from '@/components/image-upload';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', image_url: '', sort_order: 0, is_active: true });
  const [saving, setSaving] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    setLoading(true);
    fetch('/api/categories', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setCategories((d.data ?? []).sort((a: Category, b: Category) => a.sort_order - b.sort_order)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const filtered = (categories ?? []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const method = editing ? 'PATCH' : 'POST';
    const url = editing ? `/api/categories/${editing.id}` : '/api/categories';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setEditing(null);
      setShowCreate(false);
      setForm({ name: '', description: '', image_url: '', sort_order: 0, is_active: true });
      loadCategories();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría? Los productos asociados quedarán sin categoría.')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) {
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Categoría eliminada');
    }
  };

  const handleEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description ?? '', image_url: c.image_url ?? '', sort_order: c.sort_order ?? 0, is_active: c.is_active });
    setShowCreate(true);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const newCategories = [...categories];
    const draggedIndex = newCategories.findIndex(c => c.id === draggedId);
    const targetIndex = newCategories.findIndex(c => c.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const [draggedItem] = newCategories.splice(draggedIndex, 1);
    newCategories.splice(targetIndex, 0, draggedItem);

    const updatedCategories = newCategories.map((c, i) => ({ ...c, sort_order: i }));
    setCategories(updatedCategories);
    setDraggedId(null);
    setDragOverId(null);

    saveNewOrder(updatedCategories);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const saveNewOrder = async (updatedCategories: Category[]) => {
    setReordering(true);
    try {
      const res = await fetch('/api/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orders: updatedCategories.map(c => ({ id: c.id, sort_order: c.sort_order }))
        }),
      });
      if (!res.ok) throw new Error('Error saving order');
      toast.success('Orden guardado');
    } catch {
      toast.error('Error al guardar el orden');
      loadCategories();
    }
    setReordering(false);
  };

  const isOpen = showCreate || editing !== null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Categorías</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{categories.length} categorías</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setEditing(null); setForm({ name: '', description: '', image_url: '', sort_order: categories.length, is_active: true }); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#d97706', color: '#fff', borderRadius: '0.5rem', fontWeight: 500, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}
        >
          <Plus size={16} />
          Nueva Categoría
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GripVertical size={14} />
            <span>Arrastra para reordenar</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Cargando...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No se encontraron categorías</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', width: 50 }}>#</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Imagen</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Nombre</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Descripción</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Estado</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, index) => (
                <tr
                  key={c.id}
                  draggable
                  onDragStart={e => handleDragStart(e, c.id)}
                  onDragOver={e => handleDragOver(e, c.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, c.id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'grab',
                    background: draggedId === c.id ? '#fef3c7' : dragOverId === c.id ? '#fef9c3' : '#fff',
                    transition: 'background 0.2s',
                    opacity: draggedId === c.id ? 0.5 : 1,
                  }}
                >
                  <td style={{ padding: '0.75rem 1rem', color: '#9ca3af', fontSize: '0.75rem' }}>
                    <GripVertical size={16} style={{ cursor: 'grab' }} />
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '0.5rem' }} />
                    ) : (
                      <div style={{ width: 48, height: 48, background: '#f3f4f6', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={20} color="#9ca3af" />
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#111827' }}>{c.name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.875rem' }}>{c.description || '—'}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: c.is_active ? '#dcfce7' : '#fee2e2', color: c.is_active ? '#16a34a' : '#dc2626' }}>
                      {c.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(c)} style={{ padding: '0.25rem', color: '#9ca3af', border: 'none', background: 'none', cursor: 'pointer' }} title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} style={{ padding: '0.25rem', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }} title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {reordering && <div style={{ padding: '0.5rem', textAlign: 'center', background: '#fef3c7', fontSize: '0.875rem', color: '#92400e' }}>Guardando orden...</div>}
      </div>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', width: '100%', maxWidth: '500px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{editing ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button onClick={() => { setEditing(null); setShowCreate(false); }} style={{ color: '#9ca3af', border: 'none', background: 'none', cursor: 'pointer' }}>
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
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Imagen de la Categoría</label>
                <ImageUpload value={form.image_url} onChange={(url) => setForm(f => ({ ...f, image_url: url }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                <label htmlFor="active" style={{ fontSize: '0.875rem', color: '#374151' }}>Categoría activa</label>
              </div>
              <button onClick={handleSave} disabled={saving} style={{ padding: '0.5rem', background: '#d97706', color: '#fff', borderRadius: '0.5rem', fontWeight: 500, border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear Categoría'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}