# Módulo de Gestión de Productos

## Dependencias requeridas

```bash
npm install @tanstack/react-table @tanstack/react-form @tanstack/react-query zod react-dropzone react-hot-toast sweetalert2 lucide-react
npm install -D @types/react-dropzone
```

## Estructura

```
features/products/
├── api/                    # Llamadas a Supabase
│   ├── products.api.ts     # CRUD de productos
│   └── categories.api.ts   # Listado de categorías
├── components/
│   ├── ProductsTable.tsx   # Tabla con TanStack Table
│   └── ProductFormModal.tsx # Formulario con TanStack Form
├── hooks/
│   ├── use-products.ts     # Queries/Mutations con TanStack Query
│   └── use-categories.ts
├── schemas/
│   └── product.schema.ts  # Zod schemas separados
└── index.ts
```

## Usage

```tsx
import { ProductsTable } from '@/features/products';

export default function ProductsPage() {
  return <ProductsTable />;
}
```

## Características

- **TanStack Table**: Ordenamiento por columnas, filtrado global, paginación
- **TanStack Form + Zod**: Validación en tiempo real con esquemas separados
- **TanStack Query**: Cache, estados de loading/error, refetch automático
- **Componentes genéricos**: GenericInput, FileUpload, ConfirmModal, ToastProvider
