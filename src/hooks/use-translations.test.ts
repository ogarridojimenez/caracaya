import { renderHook, act } from '@testing-library/react';
import { useTranslations } from '../hooks/use-translations';
import { describe, it, expect } from 'vitest';

describe('useTranslations', () => {
  it('should return translation for existing key in Spanish', () => {
    const { result } = renderHook(() => useTranslations('es'));
    expect(result.current.t('loading')).toBe('Cargando...');
    expect(result.current.t('error')).toBe('Error');
  });

  it('should return translation for existing key in English', () => {
    const { result } = renderHook(() => useTranslations('en'));
    expect(result.current.t('loading')).toBe('Loading...');
    expect(result.current.t('error')).toBe('Error');
  });

  it('should fallback to Spanish for non-existing locale', () => {
    const { result } = renderHook(() => useTranslations('fr'));
    expect(result.current.t('loading')).toBe('Cargando...');
  });

  it('should return key itself for non-existing translation', () => {
    const { result } = renderHook(() => useTranslations('es'));
    expect(result.current.t('nonExistingKey')).toBe('nonExistingKey');
  });

  it('should return translation for order statuses', () => {
    const { result } = renderHook(() => useTranslations('es'));
    expect(result.current.t('pending')).toBe('Pendiente');
    expect(result.current.t('completed')).toBe('Completado');
  });

  it('should return translation for cart related keys', () => {
    const { result } = renderHook(() => useTranslations('es'));
    expect(result.current.t('addToCart')).toBe('Agregar al carrito');
    expect(result.current.t('total')).toBe('Total');
    expect(result.current.t('emptyCart')).toBe('Tu carrito está vacío');
  });
});