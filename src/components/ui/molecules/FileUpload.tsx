'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import type { FileUploadProps, FileWithPreview, UseFileUploadReturn } from './types';

export type { FileUploadProps, FileWithPreview, UseFileUploadReturn };

interface UseFileUploadProps extends Omit<FileUploadProps, 'onFilesSelected' | 'label' | 'error' | 'className' | 'dropzoneClassName'> {}

export function useFileUpload({
  accept,
  multiple = false,
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024,
  preview = true,
}: UseFileUploadProps = {}): UseFileUploadReturn {
  const [previews, setPreviews] = useState<FileWithPreview[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.slice(0, maxFiles);

      if (preview) {
        const withPreviews: FileWithPreview[] = validFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
        setPreviews((prev) => [...prev, ...withPreviews].slice(0, maxFiles));
      }
    },
    [maxFiles, preview]
  );

  const removeFile = useCallback((index: number) => {
    setPreviews((prev) => {
      const newFiles = [...prev];
      if (newFiles[index]?.preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  const clearFiles = useCallback(() => {
    previews.forEach((file) => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    setPreviews([]);
  }, [previews]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: accept ? { [accept]: [] } : undefined,
    multiple,
    maxFiles: maxFiles - previews.length,
    maxSize,
    onDropAccepted: onDrop,
  });

  return {
    getRootProps: () => getRootProps(),
    getInputProps: () => getInputProps(),
    isDragActive,
    previews,
    removeFile,
    clearFiles,
    open,
  };
}

export function FileUpload({
  onFilesSelected,
  accept = 'image/*',
  multiple = false,
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024,
  disabled = false,
  preview = true,
  label,
  error,
  className = '',
  dropzoneClassName = '',
}: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive, previews, removeFile, open } =
    useFileUpload({
      accept,
      multiple,
      maxFiles,
      maxSize,
      preview,
    });

  const handleFilesSelected = () => {
    onFilesSelected(previews);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div
        {...getRootProps()}
        onClick={open}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-500' : ''}
          ${dropzoneClassName}
        `}
      >
        <input {...getInputProps()} disabled={disabled} />
        <Upload className={`mx-auto h-8 w-8 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic para seleccionar'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Máx. {maxFiles} archivo{maxFiles > 1 ? 's' : ''} · {Math.round(maxSize / 1024 / 1024)}MB
        </p>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {previews.filter((f) => f.preview).map((file, index) => (
            <div key={file.name + index} className="relative group h-20 w-20">
              <Image
                src={file.preview!}
                alt={file.name}
                fill
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
