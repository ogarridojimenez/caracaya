import { NextRequest } from 'next/server';
import { sseClients } from '@/lib/sse-clients';
import { orderEvents } from '@/lib/order-events';
import { withAuth } from '@/lib/auth/helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ['manager_admin', 'vendedor', 'cliente']);
  if ('error' in auth) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      sendEvent({ type: 'connected', message: 'SSE connection established', clients: sseClients.size() });

      const clientId = sseClients.add((message: string) => {
        try {
          controller.enqueue(encoder.encode(message));
        } catch {
        }
      });

      const unsubscribe = orderEvents.on((data) => {
        sendEvent({ type: 'new_order', ...data as object });
      });

      const interval = setInterval(() => {
        sendEvent({ type: 'heartbeat', timestamp: new Date().toISOString(), clients: sseClients.size() });
      }, 30000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        unsubscribe();
        sseClients.remove(clientId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}