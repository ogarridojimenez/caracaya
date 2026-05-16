import { useEffect, useState, useCallback } from 'react';

type Notification = {
  type: string;
  [key: string]: unknown;
};

export function useNotifications() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<Notification | null>(null);

  const connect = useCallback(() => {
    const eventSource = new EventSource('/api/notifications/stream');

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastNotification(data);
        
        if (data.type === 'new_order') {
          if (typeof window !== 'undefined') {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Nuevo pedido', {
                body: `Pedido #${data.orderId} - ${data.customerName}`,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
      setTimeout(connect, 5000);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, []);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  return { isConnected, lastNotification, requestPermission };
}