'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato no permitido. Use JPG, PNG o WebP');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('El archivo debe ser menor a 2MB');
      return;
    }

    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        onChange(data.url);
      } else {
        setError(data.error || 'Error al subir imagen');
      }
    } catch {
      setError('Error de conexión');
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  if (value) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Image src={value} alt="Preview" fill style={{ objectFit: 'cover', borderRadius: 8 }} />
        <button
          onClick={clearImage}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            padding: 4,
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#F59E0B' : '#D1D5DB'}`,
          borderRadius: 8,
          padding: '2rem',
          textAlign: 'center',
          cursor: uploading ? 'default' : 'pointer',
          backgroundColor: dragging ? '#FFFBEB' : '#FAFAFA',
          transition: 'all 0.2s',
        }}
      >
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Loader className="animate-spin" size={32} color="#F59E0B" />
            <p style={{ fontSize: 14, color: '#6B7280' }}>Subiendo imagen...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Upload size={32} color="#9CA3AF" />
            <p style={{ fontSize: 14, color: '#6B7280' }}>Arrastra una imagen o haz clic para seleccionar</p>
            <p style={{ fontSize: 12, color: '#9CA3AF' }}>JPG, PNG o WebP — máximo 2MB</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChange} style={{ display: 'none' }} />
      {error && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{error}</p>}
    </div>
  );
}