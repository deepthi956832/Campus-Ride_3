import { io, Socket } from 'socket.io-client';
import { BASE_URL } from './api';

// The socket server is the same as the API server in this setup
// We need to strip the /api from the BASE_URL for the socket connection
const socketUrl = BASE_URL.replace('/api', '');

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  connect() {
    if (this.socket?.connected) return;

    console.log('--- SOCKET SERVICE: ATTEMPTING CONNECTION ---');
    console.log('Socket URL:', socketUrl);
    
    this.socket = io(socketUrl, {
      transports: ['polling', 'websocket'], // Start with polling for faster initial connection
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity, // Keep trying
    });

    this.socket.on('connect', () => {
      console.log('--- SOCKET SERVICE: CONNECTED SUCCESSFULLY (ID: ' + this.socket?.id + ') ---');
    });

    this.socket.on('connect_error', (error) => {
      console.error('--- SOCKET SERVICE: CONNECTION ERROR ---', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('--- SOCKET SERVICE: DISCONNECTED ---', reason);
    });

    // Re-register all listeners on the actual socket
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(cb => {
        this.socket?.on(event, cb);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
    this.socket?.off(event, callback);
  }
}

export const socketService = new SocketService();
