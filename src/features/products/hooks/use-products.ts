import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as productsApi from '@/lib/api/products';

export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: () => [...productsKeys.lists()] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productsKeys.list(),
    queryFn: () => productsApi.getProducts(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productsKeys.detail(id),
    queryFn: () => productsApi.getProduct(id),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: Partial<any>) => productsApi.createProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, product }: { id: string; product: Partial<any> }) =>
      productsApi.updateProduct(id, product),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(id) });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
}