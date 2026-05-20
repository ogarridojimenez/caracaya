'use client';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Error en administración
        </h2>
        <p className="text-gray-600 mb-4 text-sm">
          {error.message || 'Ha ocurrido un error al cargar la sección de administración'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
