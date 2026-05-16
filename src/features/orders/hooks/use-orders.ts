import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ordersApi from '@/lib/api/orders';

export const ordersKeys = {
  all: ['orders'] as const,
  lists: () => [...ordersKeys.all, 'list'] as const,
  list: (userId?: string, page = 1, limit = 10) => [...ordersKeys.lists(), userId ?? 'all', page, limit] as const,
  details: () => [...ordersKeys.all, 'detail'] as const,
  detail: (id: string) => [...ordersKeys.details(), id] as const,
  summary: (filters?: { startDate?: string; endDate?: string }) => 
    [...ordersKeys.all, 'summary', filters] as const,
  daily: (filters?: { startDate?: string; endDate?: string }) => 
    [...ordersKeys.all, 'daily', filters] as const,
};

export function useOrders(userId?: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ordersKeys.list(userId, page, limit),
    queryFn: () => ordersApi.getOrders(userId, page, limit),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ordersKeys.detail(id),
    queryFn: () => ordersApi.getOrder(id),
    enabled: Boolean(id),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ordersApi.CreateOrderInput) => ordersApi.createOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.summary() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.daily() });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      ordersApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.summary() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.daily() });
    },
  });
}

export function useSalesSummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ordersKeys.summary({ startDate, endDate }),
    queryFn: () => ordersApi.getSalesSummary(startDate, endDate),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDailySales(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ordersKeys.daily({ startDate, endDate }),
    queryFn: () => ordersApi.getDailySales(startDate, endDate),
    staleTime: 1000 * 60 * 5,
  });
}