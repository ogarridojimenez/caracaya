import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, userUpdateSchema, recoverSchema } from '../auth';

describe('registerSchema', () => {
  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Juan Perez',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
      full_name: 'Juan',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: '12345',
      full_name: 'Juan',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      full_name: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional phone', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Juan',
      phone: '+52 123 456 7890',
    });
    expect(result.success).toBe(true);
  });
});

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
    });
    expect(result.success).toBe(false);
  });
});

describe('userUpdateSchema', () => {
  it('accepts valid role', () => {
    const result = userUpdateSchema.safeParse({ role: 'vendedor' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid role', () => {
    const result = userUpdateSchema.safeParse({ role: 'superadmin' });
    expect(result.success).toBe(false);
  });

  it('accepts partial update', () => {
    const result = userUpdateSchema.safeParse({ full_name: 'Nuevo Nombre' });
    expect(result.success).toBe(true);
  });
});

describe('recoverSchema', () => {
  it('accepts valid email', () => {
    const result = recoverSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = recoverSchema.safeParse({ email: 'invalid' });
    expect(result.success).toBe(false);
  });
});
