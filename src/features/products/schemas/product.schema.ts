import { z } from 'zod';

export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  slug: z.string(),
  description: z.string().max(500).optional(),
  price: z.coerce.number()
    .min(0.01, 'El precio debe ser mayor a 0')
    .max(99999.99),
  category_id: z.string().uuid('Selecciona una categoría'),
  image_url: z.string().url().optional().or(z.literal('')),
  is_available: z.boolean(),
  stock_quantity: z.coerce.number().int().min(0),
  low_stock_threshold: z.coerce.number().int().min(0),
  is_featured: z.boolean(),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const productFilterSchema = z.object({
  category: z.string().uuid().optional(),
  search: z.string().optional(),
  inStock: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
});

export type ProductFilterData = z.infer<typeof productFilterSchema>;
