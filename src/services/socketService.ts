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
      
      // Determine if we should force secure WebSockets based on server URL
      const forceSecure = SERVER_URL.startsWith('https://');

      // Calculate connection timeout based on attempt number
      const connectionTimeout = 5000 + (this.reconnectAttempts * 2000);
      
      this.socket = io(SERVER_URL, {
        transports: ['websocket' , 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        // App Engine Standard specific settings
        timeout: connectionTimeout,
        // Don't force SSL - App Engine handles this
        secure: forceSecure,
        forceNew: true,
        path: '/socket.io/',
        // Remove extraHeaders for Standard
      });

      this.setupEventListeners();

      // Authenticate after connecting
      this.socket.on('connect', () => {
        console.log('Socket connected, authenticating...');
        console.log('Active transport:', this.socket?.io.engine.transport.name);
        this.authenticate(userId);
        this.isConnected = true;
        resolve(true);
      });

      // Log transport changes - using any for engine to avoid TypeScript errors
      if (this.socket && this.socket.io && (this.socket.io.engine as any)) {
        (this.socket.io.engine as any).on('transportChange', (transport: any) => {
          console.log('Transport changed from', transport.name, 'to', (this.socket?.io.engine as any).transport.name);
        });
      }

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        console.error('Connection details:', {
          url: SERVER_URL,
          userId: this.userId,
          attempt: this.reconnectAttempts + 1,
          error: error.message,
          transport: this.socket?.io?.engine?.transport?.name || 'unknown'
        });
        
        this.isConnected = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnect attempts reached, falling back to HTTP polling only');
          
          // Last attempt with polling only before giving up
          if (this.socket) {
            this.socket.io.opts.transports = ['polling'];
            this.socket.connect();
            
            // Set a timeout for this final attempt
            setTimeout(() => {
              if (!this.isConnected) {
                console.error('Failed to connect even with polling transport');
                resolve(false);
              }
            }, 5000);
          } else {
            resolve(false);
          }
        }
      });
      
      // Add additional error event handler
      this.socket.on('error', (error) => {
        console.error('Socket general error:', error);
      });
      
      // Add connect timeout handler
      this.socket.on('connect_timeout', (timeout) => {
        console.error('Socket connection timeout after', timeout, 'ms');
      });

      // Set a timeout for initial connection
      setTimeout(() => {
        if (!this.isConnected) {
          console.error('Initial connection timeout, resolving as false');
          resolve(false);
        }
      }, 10000); // 10 second timeout for initial connection
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
      console.log('New message received via WebSocket:', message);
      
      // Ensure message has all required fields before dispatching
      if (message && message.id && message.chat_room_id) {
        // Don't dispatch messages sent by the current user (already in state from API response)
        if (message.sender_id === this.userId) {
          console.log('Ignoring own message broadcast from server');
          return;
        }
        
        // Only dispatch messages from other users
        store.dispatch(receiveMessage(message));
      } else {
        console.error('Received malformed message from socket:', message);
      }
    });

    // Additional listener for message_broadcast event (server might use a different event name)
    this.socket.on('message_broadcast', (message: any) => {
      console.log('Message broadcast received:', message);
      if (message && message.id) {
        // Don't dispatch messages sent by the current user (already in state from API response)
        if (message.sender_id === this.userId || message.senderId === this.userId) {
          console.log('Ignoring own message broadcast');
          return;
        }
        
        store.dispatch(receiveMessage(message));
      }
    });

    // User typing indicator
    this.socket.on('user_typing', (data: { chatId: string; userId: string; isTyping: boolean }) => {
      console.log('User typing:', data);
      // Implement typing indicator in UI if needed
    });

    // Handle disconnection
    this.socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      
      // Clear active rooms on disconnect
      this.activeRooms.clear();
      
      // Attempt to reconnect if not intentionally closed
      if (reason !== 'io client disconnect') {
        console.log('Attempting to reconnect...');
        if (this.userId) {
          setTimeout(() => {
            this.initSocket(this.userId!);
          }, 2000);
        }
      }
    });
    
    // Listen for any socket events to help debug (development only)
    if (process.env.NODE_ENV !== 'production') {
      this.socket.onAny((event, ...args) => {
        console.log(`Socket event received: ${event}`, args);
      });
    }
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
      console.error('Cannot send message via socket: not connected');
      console.log('Message will still be saved in the database and appear after refresh');
      // The message will still be sent to the server via the API call in ChatScreen.tsx
      // (when the user calls dispatch(sendMessage(...)))
      return;
    }

    console.log('Sending message to chat room via WebSocket:', chatId, message);
    // Include chatId with the message payload to ensure the server knows where to broadcast
    this.socket.emit('send_message', { ...message, chatId });
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