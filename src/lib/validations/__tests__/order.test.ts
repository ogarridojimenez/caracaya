import { describe, it, expect } from 'vitest';
import { orderStatusUpdateSchema, orderCreateSchema } from '../order';

describe('orderStatusUpdateSchema', () => {
  it('accepts valid statuses', () => {
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    for (const status of validStatuses) {
      const result = orderStatusUpdateSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid status', () => {
    const result = orderStatusUpdateSchema.safeParse({ status: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects missing status', () => {
    const result = orderStatusUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('orderCreateSchema', () => {
  const validItem = {
    product_id: '123e4567-e89b-12d3-a456-426614174000',
    quantity: 2,
    unit_price: 2.5,
  };

  it('accepts valid order body', () => {
    const result = orderCreateSchema.safeParse({
      items: [validItem],
    });
    expect(result.success).toBe(true);
  });

  it('accepts order with optional fields', () => {
    const result = orderCreateSchema.safeParse({
      items: [validItem],
      notes: 'Sin azúcar',
      delivery_address: 'Calle 123',
      delivery_phone: '555-1234',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty items array', () => {
    const result = orderCreateSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
  });

  it('rejects item with quantity < 1', () => {
    const result = orderCreateSchema.safeParse({
      items: [{ ...validItem, quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects item with negative price', () => {
    const result = orderCreateSchema.safeParse({
      items: [{ ...validItem, unit_price: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing items', () => {
    const result = orderCreateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
