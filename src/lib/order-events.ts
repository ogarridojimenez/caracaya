import { EventEmitter } from 'events';

declare global {
  var __orderEvents: OrderEventEmitter | undefined;
}

class OrderEventEmitter extends EventEmitter {
  broadcastOrderCreated(orderData: object) {
    this.emit('order_created', orderData);
  }
}

function getOrderEvents(): OrderEventEmitter {
  if (!global.__orderEvents) {
    global.__orderEvents = new OrderEventEmitter();
  }
  return global.__orderEvents;
}

export const orderEvents = {
  emit: (data: object) => getOrderEvents().broadcastOrderCreated(data),
  on: (callback: (data: object) => void) => {
    getOrderEvents().on('order_created', callback);
    return () => getOrderEvents().off('order_created', callback);
  }
};