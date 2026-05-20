import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit } from '../rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    // The Map is module-level, so each test starts fresh enough
  });

  it('allows first request', () => {
    const result = checkRateLimit('test-user-1', 'login');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('tracks remaining requests', () => {
    const id = `test-user-${Date.now()}`;
    checkRateLimit(id, 'test');
    checkRateLimit(id, 'test');
    const result = checkRateLimit(id, 'test');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('blocks after max requests', () => {
    const id = `test-block-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      checkRateLimit(id, 'test');
    }
    const result = checkRateLimit(id, 'test');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('uses default endpoint when not specified', () => {
    const id = `test-default-${Date.now()}`;
    const result = checkRateLimit(id);
    expect(result.allowed).toBe(true);
  });

  it('separates by endpoint', () => {
    const id = `test-endpoint-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      checkRateLimit(id, 'login');
    }
    const blocked = checkRateLimit(id, 'login');
    expect(blocked.allowed).toBe(false);

    const allowed = checkRateLimit(id, 'register');
    expect(allowed.allowed).toBe(true);
  });
});
