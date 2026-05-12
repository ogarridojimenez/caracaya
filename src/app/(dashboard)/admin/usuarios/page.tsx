'use client';

import { useState, useEffect } from 'react';
import { User, Plus, Search, Pencil, Trash2, X } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const roleLabels: Record<string, string> = {
  cliente: 'Cliente',
  vendedor: 'Vendedor',
  manager_admin: 'Administrador',
};

const roleColors: Record<string, string> = {
  cliente: 'bg-blue-100 text-blue-800',
  vendedor: 'bg-green-100 text-green-800',
  manager_admin: 'bg-purple-100 text-purple-800',
};

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'cliente', password: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadUsers = () => {
    setLoading(true);
    fetch('/api/auth/users', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setUsers(d.data ?? []); })
      .catch(() => setError('Error cargando usuarios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleEdit = async (id: string) => {
    const res = await fetch(`/api/auth/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role: editRole }),
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: editRole } : u));
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    const res = await fetch(`/api/auth/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== id));
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Error al eliminar');
    }
  };

  const handleCreate = async () => {
    setError('');
    if (!newUser.email || !newUser.password || !newUser.name) {
      setError('Completa todos los campos');
      return;
    }
    const res = await fetch('/api/auth/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      setShowCreate(false);
      setNewUser({ name: '', email: '', role: 'cliente', password: '' });
      loadUsers();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Error al crear usuario');
    }
  };

  const filtered = (users ?? []).filter(u =>
    (u.name ?? u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500">{users.length} usuarios registrados</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No se encontraron usuarios</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="font-medium text-gray-900">{user.name || user.full_name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    {editingId === user.id ? (
                      <select
                        value={editRole}
                        onChange={e => setEditRole(e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                        autoFocus
                        onBlur={() => handleEdit(user.id)}
                      >
                        <option value="cliente">Cliente</option>
                        <option value="vendedor">Vendedor</option>
                        <option value="manager_admin">Administrador</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
                        {roleLabels[user.role] || user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditingId(user.id); setEditRole(user.role); }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Editar rol"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Nuevo Usuario</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="cliente">Cliente</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="manager_admin">Administrador</option>
                </select>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={handleCreate}
                className="w-full py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
              >
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}