import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50),
  description: z.string().max(200).optional(),
  is_active: z.boolean().optional().default(true),
});

export const categoryUpdateSchema = categorySchema.partial();

export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;