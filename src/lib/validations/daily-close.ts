import { z } from 'zod';

export const dailyCloseSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida'),
  total_sales: z.number().positive(),
  total_orders: z.number().int().positive(),
  cash_amount: z.number().optional().default(0),
  card_amount: z.number().optional().default(0),
  transfer_amount: z.number().optional().default(0),
  notes: z.string().max(500).optional(),
});

export type DailyCloseInput = z.infer<typeof dailyCloseSchema>;