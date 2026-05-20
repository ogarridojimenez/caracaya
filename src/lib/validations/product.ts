import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive('El precio debe ser positivo'),
  category_id: z.string().uuid('ID de categoría inválido'),
  image_url: z.string().url().optional().or(z.literal('')),
  is_available: z.boolean().optional().default(true),
  is_featured: z.boolean().optional().default(false),
  stock_quantity: z.number().int().min(0).optional().default(0),
});

export const productUpdateSchema = productSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;