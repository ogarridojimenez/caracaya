import { useEffect, useState, useCallback, useRef } from 'react';

type Notification = {
  type: string;
  [key: string]: unknown;
};

const MAX_RETRIES = 5;
const INITIAL_DELAY = 5000;

export function useNotifications() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<Notification | null>(null);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (retryCountRef.current >= MAX_RETRIES) {
      console.log('Max retries reached for SSE connection');
      return;
    }

    const eventSource = new EventSource('/api/notifications/stream');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      retryCountRef.current = 0;
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
      eventSourceRef.current = null;

      retryCountRef.current++;
      const delay = Math.min(INITIAL_DELAY * Math.pow(2, retryCountRef.current - 1), 30000);

      console.log(`SSE reconnect attempt ${retryCountRef.current}/${MAX_RETRIES} in ${delay}ms`);

      if (retryCountRef.current < MAX_RETRIES) {
        timeoutRef.current = setTimeout(connect, delay);
      }
    };

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
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