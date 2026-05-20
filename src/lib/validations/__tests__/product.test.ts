import { describe, it, expect } from 'vitest';
import { productSchema, productUpdateSchema } from '../product';
import { categorySchema } from '../category';

describe('productSchema', () => {
  it('accepts valid product data', () => {
    const result = productSchema.safeParse({
      name: 'Café Americano',
      price: 45.50,
      category_id: '123e4567-e89b-12d3-a456-426614174000',
      stock_quantity: 100,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative price', () => {
    const result = productSchema.safeParse({
      name: 'Café',
      price: -10,
      category_id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = productSchema.safeParse({
      name: '',
      price: 45,
      category_id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(result.success).toBe(false);
  });

  it('defaults stock_quantity to 0', () => {
    const result = productSchema.safeParse({
      name: 'Café',
      price: 45,
      category_id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stock_quantity).toBe(0);
    }
  });
});

describe('productUpdateSchema', () => {
  it('accepts partial update', () => {
    const result = productUpdateSchema.safeParse({ name: 'Nuevo Nombre' });
    expect(result.success).toBe(true);
  });

  it('accepts price update', () => {
    const result = productUpdateSchema.safeParse({ price: 99.99 });
    expect(result.success).toBe(true);
  });
});

describe('categorySchema', () => {
  it('accepts valid category', () => {
    const result = categorySchema.safeParse({ name: 'Bebidas' });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = categorySchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('does not accept icon or color fields', () => {
    const result = categorySchema.safeParse({
      name: 'Bebidas',
      icon: 'coffee',
      color: '#FF0000',
    });
    // icon and color should be stripped/ignored
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('icon');
      expect(result.data).not.toHaveProperty('color');
    }
  });
});
