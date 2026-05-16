import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebounce } from '../hooks/use-debounce';
import { describe, it, expect } from 'vitest';

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should update value after delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });

    await waitFor(() => {
      expect(result.current).toBe('updated');
    }, { timeout: 1000 });
  });

  it('should use custom delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    rerender({ value: 'updated', delay: 300 });

    await waitFor(() => {
      expect(result.current).toBe('updated');
    }, { timeout: 1000 });
  });

  it('should cancel previous timer on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'first', delay: 500 });
    rerender({ value: 'second', delay: 500 });
    rerender({ value: 'third', delay: 500 });

    await waitFor(() => {
      expect(result.current).toBe('third');
    }, { timeout: 1000 });
  });
});