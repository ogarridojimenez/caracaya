import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  full_name: z.string().min(1, 'El nombre es requerido').max(100),
  phone: z.string().max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const userUpdateSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  role: z.enum(['cliente', 'vendedor', 'manager_admin']).optional(),
});

export const recoverSchema = z.object({
  email: z.string().email('Email inválido'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type RecoverInput = z.infer<typeof recoverSchema>;