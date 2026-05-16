'use client';

import { useCallback } from 'react';

const translations: Record<string, Record<string, string>> = {
  es: {
    'loading': 'Cargando...',
    'error': 'Error',
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'delete': 'Eliminar',
    'edit': 'Editar',
    'search': 'Buscar',
    'noResults': 'No hay resultados',
    'back': 'Volver',
    'login': 'Iniciar sesión',
    'logout': 'Cerrar sesión',
    'pending': 'Pendiente',
    'confirmed': 'Confirmado',
    'preparing': 'Preparando',
    'ready': 'Listo',
    'completed': 'Completado',
    'cancelled': 'Cancelado',
    'addToCart': 'Agregar al carrito',
    'outOfStock': 'Sin stock',
    'total': 'Total',
    'subtotal': 'Subtotal',
    'items': 'items',
    'checkout': 'Finalizar pedido',
    'emptyCart': 'Tu carrito está vacío',
  },
  en: {
    'loading': 'Loading...',
    'error': 'Error',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'search': 'Search',
    'noResults': 'No results',
    'back': 'Back',
    'login': 'Log in',
    'logout': 'Log out',
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'preparing': 'Preparing',
    'ready': 'Ready',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'addToCart': 'Add to cart',
    'outOfStock': 'Out of stock',
    'total': 'Total',
    'subtotal': 'Subtotal',
    'items': 'items',
    'checkout': 'Checkout',
    'emptyCart': 'Your cart is empty',
  }
};

export function useTranslations(locale: string = 'es') {
  const t = useCallback((key: string): string => {
    return translations[locale]?.[key] || translations['es'][key] || key;
  }, [locale]);

  return { t };
}