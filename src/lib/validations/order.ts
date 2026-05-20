import { z } from 'zod';

const orderItemSchema = z.object({
  product_id: z.string().uuid('ID de producto inválido'),
  quantity: z.number().int().positive('La cantidad debe ser positive'),
  unit_price: z.number().positive(),
});

export const orderCreateSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Debe incluir al menos un producto'),
  notes: z.string().max(500).optional(),
  delivery_address: z.string().max(255).optional(),
  delivery_phone: z.string().max(20).optional(),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']),
});

export type OrderInput = z.infer<typeof orderCreateSchema>;
export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;