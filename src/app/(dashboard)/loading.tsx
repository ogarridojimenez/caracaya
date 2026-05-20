export default function DashboardLoading() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Cargando...</p>
      </div>
    </div>
  );
}
