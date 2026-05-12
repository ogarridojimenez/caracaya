'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks';
import { User, Mail, Lock, Save, AlertCircle, CheckCircle, Upload } from 'lucide-react';
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

  return (
    <div className="max-w-2xl mx-auto">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <User className="h-6 w-6 text-amber-600" />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Mi Perfil</h1>
      </div>

      {message && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          backgroundColor: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: message.type === 'success' ? '#065F46' : '#991B1B',
        }}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Información Personal</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User className="h-8 w-8 text-white" />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>Foto de perfil</label>
              <ImageUpload value={avatarUrl} onChange={setAvatarUrl} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>Nombre completo</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                }}
                placeholder="Tu nombre"
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 16px',
                  backgroundColor: '#F59E0B',
                  color: 'white',
                  borderRadius: 8,
                  fontWeight: 500,
                  fontSize: 14,
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1,
                }}
              >
                <Save className="h-4 w-4" />
                Guardar
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>Correo electrónico</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail className="h-4 w-4 text-gray-400" />
              <span style={{ fontSize: 14, color: '#374151' }}>{userData?.email}</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>Rol</label>
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              backgroundColor: userData?.role === 'manager_admin' ? '#F3E8FF' : userData?.role === 'vendedor' ? '#DCFCE7' : '#DBEAFE',
              color: userData?.role === 'manager_admin' ? '#6B21A8' : userData?.role === 'vendedor' ? '#166534' : '#1E40AF',
            }}>
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 16 }}>
          <Lock className="h-4 w-4 inline mr-2" style={{ display: 'inline', marginRight: 8 }} />
          Cambiar Contraseña
        </h2>

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
              }}
              placeholder="Ingresa tu contraseña actual"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
              }}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>Confirmar nueva contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
              }}
              placeholder="Repite la nueva contraseña"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              backgroundColor: '#1F2937',
              color: 'white',
              borderRadius: 8,
              fontWeight: 500,
              fontSize: 14,
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1,
            }}
          >
            <Lock className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}