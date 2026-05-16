import Link from 'next/link';
import { AlertTriangle, Home } from 'lucide-react';

export default function Error500() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          500
        </h1>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Error interno del servidor
        </h2>
        <p className="text-gray-600 mb-8">
          Lo sentimos, estamos teniendo problemas técnicos. 
          Por favor intenta más tarde.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
        >
          <Home className="w-5 h-5" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}