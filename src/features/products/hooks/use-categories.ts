'use client';

import { useQuery } from '@tanstack/react-query';
import * as categoriesApi from '@/lib/api/categories';

export const categoriesKeys = {
  all: ['categories'] as const,
  list: () => [...categoriesKeys.all, 'list'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoriesKeys.list(),
    queryFn: () => categoriesApi.getCategories(),
    staleTime: 1000 * 60 * 30,
  });
}