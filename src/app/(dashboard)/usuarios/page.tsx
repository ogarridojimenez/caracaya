'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Shield, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { UserRole } from '@/domain/types/database';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

const roleColors: Record<UserRole, string> = {
  cliente: 'bg-blue-100 text-blue-800',
  vendedor: 'bg-green-100 text-green-800',
  manager_admin: 'bg-purple-100 text-purple-800',
};

const roleLabels: Record<UserRole, string> = {
  cliente: 'Cliente',
  vendedor: 'Vendedor',
  manager_admin: 'Admin',
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data ?? []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-6 w-6" />
          Gestión de Usuarios
        </h1>
        <p className="text-sm text-gray-500 mt-1">{users.length} usuarios registrados</p>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por email o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3">Nombre</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Rol</th>
                  <th className="pb-3">Fecha registro</th>
                  <th className="pb-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">{user.full_name || '—'}</td>
                    <td className="py-3 text-gray-600">{user.email}</td>
                    <td className="py-3">
                      {editingUser?.id === user.id ? (
                        <select
                          value={editingUser.role}
                          onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                          className="px-2 py-1 border rounded text-sm">
                          <option value="cliente">Cliente</option>
                          <option value="vendedor">Vendedor</option>
                          <option value="manager_admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[user.role]}`}>
                          {roleLabels[user.role]}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-gray-500 text-sm">
                      {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3">
                      {editingUser?.id === user.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateUserRole(user.id, editingUser.role)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingUser(user)}
                          className="flex items-center gap-1 px-3 py-1 text-amber-600 hover:bg-amber-50 rounded text-sm">
                          <Edit2 className="h-4 w-4" />
                          Cambiar rol
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}