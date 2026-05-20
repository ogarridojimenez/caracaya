'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
      const res = await fetch('/api/categories', {
        method: 'POST',
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
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-sm text-gray-500">{categories.length} categorías</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setEditing(null); setForm({ name: '', description: '', image_url: '', sort_order: categories.length, is_active: true }); }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium text-sm hover:bg-amber-700"
        >
          <Plus size={16} />
          Nueva Categoría
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <GripVertical size={14} />
            <span>Arrastra para reordenar</span>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No se encontraron categorías</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  draggable
                  onDragStart={e => handleDragStart(e, c.id)}
                  onDragOver={e => handleDragOver(e, c.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, c.id)}
                  onDragEnd={handleDragEnd}
                  className={`border-b border-gray-100 cursor-grab transition-colors ${draggedId === c.id ? 'bg-yellow-50 opacity-50' : dragOverId === c.id ? 'bg-yellow-50' : 'bg-white'}`}
                >
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    <GripVertical size={16} className="cursor-grab" />
                  </td>
                  <td className="px-4 py-3">
                    {c.image_url ? (
                      <Image src={c.image_url} alt={c.name} width={48} height={48} className="object-cover rounded-lg" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon size={20} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{c.description || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {c.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(c)} className="p-1 text-gray-400 hover:text-blue-600" title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-1 text-gray-400 hover:text-red-600" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {reordering && <div className="p-2 text-center bg-yellow-50 text-amber-800 text-sm">Guardando orden...</div>}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">{editing ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button onClick={() => { setEditing(null); setShowCreate(false); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[60px]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de la Categoría</label>
                <ImageUpload value={form.image_url} onChange={(url) => setForm(f => ({ ...f, image_url: url }))} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded" />
                <label htmlFor="active" className="text-sm text-gray-700">Categoría activa</label>
              </div>
              <button onClick={handleSave} disabled={saving} className="py-2 bg-amber-600 text-white rounded-lg font-medium disabled:opacity-60">
                {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear Categoría'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}