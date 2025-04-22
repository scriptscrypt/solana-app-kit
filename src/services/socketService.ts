/**
 * Service for managing WebSocket connections for real-time chat
 */
import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from '@env';
import { store } from '@/shared/state/store';
import { receiveMessage } from '@/shared/state/chat/slice';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private activeRooms: Set<string> = new Set();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  // Initialize the socket connection
  public initSocket(userId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.socket && this.isConnected && this.userId === userId) {
        console.log('Socket already connected for user', userId);
        resolve(true);
        return;
      }

      if (this.socket) {
        this.socket.disconnect();
      }

      this.userId = userId;
      this.reconnectAttempts = 0;

      console.log('Initializing socket connection to:', SERVER_URL);
      this.socket = io(SERVER_URL, {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      this.setupEventListeners();

      // Authenticate after connecting
      this.socket.on('connect', () => {
        console.log('Socket connected, authenticating...');
        this.authenticate(userId);
        this.isConnected = true;
        resolve(true);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnect attempts reached');
          resolve(false);
        }
      });
    });
  }

  // Set up socket event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Authentication response
    this.socket.on('authenticated', (data: { success: boolean }) => {
      console.log('Authentication result:', data);
    });

    // New message received
    this.socket.on('new_message', (message: any) => {
      console.log('New message received:', message);
      store.dispatch(receiveMessage(message));
    });

    // User typing indicator
    this.socket.on('user_typing', (data: { chatId: string; userId: string; isTyping: boolean }) => {
      console.log('User typing:', data);
      // Implement typing indicator in UI if needed
    });

    // Handle errors
    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    // Handle disconnection
    this.socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      
      // Clear active rooms on disconnect
      this.activeRooms.clear();
    });
  }

  // Authenticate with the socket server
  private authenticate(userId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot authenticate: socket not connected');
      return;
    }

    this.socket.emit('authenticate', { userId });
  }

  // Join a chat room
  public joinChat(chatId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot join chat: socket not connected');
      return;
    }

    if (this.activeRooms.has(chatId)) {
      console.log('Already in room:', chatId);
      return;
    }

    console.log('Joining chat room:', chatId);
    this.socket.emit('join_chat', { chatId });
    this.activeRooms.add(chatId);
  }

  // Leave a chat room
  public leaveChat(chatId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot leave chat: socket not connected');
      return;
    }

    if (!this.activeRooms.has(chatId)) {
      console.log('Not in room:', chatId);
      return;
    }

    console.log('Leaving chat room:', chatId);
    this.socket.emit('leave_chat', { chatId });
    this.activeRooms.delete(chatId);
  }

  // Send a message to a chat room
  public sendMessage(chatId: string, message: any): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot send message: socket not connected');
      return;
    }

    console.log('Sending message to chat room:', chatId, message);
    this.socket.emit('send_message', message);
  }

  // Send typing indicator
  public sendTypingIndicator(chatId: string, isTyping: boolean): void {
    if (!this.socket || !this.socket.connected) return;

    this.socket.emit('typing', { chatId, isTyping });
  }

  // Disconnect the socket
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
      this.activeRooms.clear();
      console.log('Socket disconnected');
    }
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService; 