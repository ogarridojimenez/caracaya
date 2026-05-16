declare global {
  var __sseClients: ((data: string) => void)[] | undefined;
}

function getClients(): ((data: string) => void)[] {
  if (!global.__sseClients) {
    global.__sseClients = [];
  }
  return global.__sseClients;
}

export const sseClients = {
  add(client: (data: string) => void) {
    getClients().push(client);
    return client;
  },
  remove(client: (data: string) => void) {
    const clients = getClients();
    const index = clients.indexOf(client);
    if (index > -1) {
      clients.splice(index, 1);
    }
  },
  broadcast(data: object) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    getClients().forEach(client => {
      try {
        client(message);
      } catch {
      }
    });
  },
  size() {
    return getClients().length;
  }
};