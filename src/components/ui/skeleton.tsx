'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex justify-between pt-2 border-t">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>
    </div>
  );
}

export function SkeletonKanban() {
  return (
    <div className="flex gap-4 pb-4 min-w-max">
      {['Pendiente', 'Confirmado', 'Preparando', 'Listo', 'Completado'].map((status, i) => (
        <div key={status} className="w-72 flex-shrink-0">
          <div className={`rounded-t-lg px-3 py-2 border-b border-gray-200 bg-gray-100`}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
          </div>
          <div className="bg-gray-50 rounded-b-lg p-2 min-h-[200px] space-y-2 border border-t-0 border-gray-200">
            {Array.from({ length: i === 0 ? 2 : 1 }).map((_, j) => (
              <SkeletonCard key={j} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonProductCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow p-4 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex justify-between pt-2 border-t">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-32 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}