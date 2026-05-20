import { z } from 'zod';

export const dailyCloseSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida'),
  total_sales: z.number().positive(),
  notes: z.string().max(500).optional(),
});

export type DailyCloseInput = z.infer<typeof dailyCloseSchema>;