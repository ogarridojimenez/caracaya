'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/features/auth/hooks';
import { User, Mail, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { ImageUpload } from '@/components/image-upload';

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUserData(data.user);
        setFullName(data.user.full_name || '');
        setAvatarUrl(data.user.avatar_url || '');
      }
    } catch {
      setMessage({ type: 'error', text: 'Error al cargar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ full_name: fullName, avatar_url: avatarUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al actualizar' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' });
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Contraseña cambiada correctamente' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al cambiar contraseña' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const roleLabel = userData?.role === 'manager_admin' ? 'Administrador' : userData?.role === 'vendedor' ? 'Vendedor' : 'Cliente';

  const roleBgColor = userData?.role === 'manager_admin' ? 'bg-purple-100 text-purple-800' : userData?.role === 'vendedor' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6 text-amber-600" />
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Información Personal</h2>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" width={80} height={80} className="rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-500 mb-1">Foto de perfil</label>
              <ImageUpload value={avatarUrl} onChange={setAvatarUrl} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Nombre completo</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Tu nombre"
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium text-sm hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                Guardar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Correo electrónico</label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">{userData?.email}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Rol</label>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${roleBgColor}`}>
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Cambiar Contraseña
        </h2>

        <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Ingresa tu contraseña actual"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Confirmar nueva contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Repite la nueva contraseña"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="self-start flex items-center gap-1.5 px-5 py-2 bg-gray-800 text-white rounded-lg font-medium text-sm hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}