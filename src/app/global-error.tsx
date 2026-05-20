'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error crítico
            </h2>
            <p className="text-gray-600 mb-4">
              {error.message || 'Ha ocurrido un error inesperado'}
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}