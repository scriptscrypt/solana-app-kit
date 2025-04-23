/**
 * Service for managing WebSocket connections for real-time chat
 */
import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from '@env';
import { store } from '@/shared/state/store';
import { receiveMessage, updateUnreadCount } from '@/shared/state/chat/slice';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private activeRooms: Set<string> = new Set();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private currentChatId: string | null = null; // Track which chat is currently open

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
        
        // Rejoin all active rooms after reconnection
        this.rejoinActiveRooms();
        
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
        // Always dispatch message to update the store
        store.dispatch(receiveMessage({
          ...message,
          _meta: { currentUserId: this.userId }  // Add metadata for the reducer
        }));
        
        // If not in the same chat room, increment unread count
        if (this.currentChatId !== message.chat_room_id && message.sender_id !== this.userId) {
          store.dispatch(updateUnreadCount({
            chatId: message.chat_room_id,
            increment: true
          }));
        }
      } else {
        console.error('Received malformed message from socket:', message);
      }
    });

    // Additional listener for message_broadcast event (server might use a different event name)
    this.socket.on('message_broadcast', (message: any) => {
      console.log('Message broadcast received:', message);
      if (message && message.id) {
        // Always dispatch message to update the store
        store.dispatch(receiveMessage({
          ...message,
          _meta: { currentUserId: this.userId }  // Add metadata for the reducer
        }));
        
        // If not in the same chat room, increment unread count
        if (this.currentChatId !== message.chat_room_id && 
            message.sender_id !== this.userId && 
            message.senderId !== this.userId) {
          store.dispatch(updateUnreadCount({
            chatId: message.chat_room_id,
            increment: true
          }));
        }
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
      
      // Don't clear active rooms on disconnect so we can rejoin them on reconnect
      
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

  // Set which chat is currently being viewed (for unread count tracking)
  public setCurrentChat(chatId: string | null): void {
    this.currentChatId = chatId;
  }

  // Join all user's chat rooms at once (used for initial setup)
  public joinAllChats(chatIds: string[]): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot join chats: socket not connected');
      return;
    }

    chatIds.forEach(chatId => {
      if (!this.activeRooms.has(chatId) && this.socket) {
        console.log('Joining chat room:', chatId);
        this.socket.emit('join_chat', { chatId });
        this.activeRooms.add(chatId);
      }
    });
  }

  // Private method to rejoin all active rooms after reconnection
  private rejoinActiveRooms(): void {
    if (!this.socket || !this.socket.connected) return;
    
    console.log(`Rejoining ${this.activeRooms.size} active rooms`);
    this.activeRooms.forEach(chatId => {
      if (this.socket) {
        this.socket.emit('join_chat', { chatId });
        console.log('Rejoined room:', chatId);
      }
    });
  }

  // Send a message to a chat room
  public sendMessage(chatId: string, message: any): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot send message: socket not connected');
      return;
    }

    if (!this.activeRooms.has(chatId)) {
      console.log('Joining room before sending message:', chatId);
      this.joinChat(chatId);
    }

    this.socket.emit('send_message', {
      chatId,
      message,
    });
  }

  // Send typing indicator to a chat room
  public sendTypingIndicator(chatId: string, isTyping: boolean): void {
    if (!this.socket || !this.socket.connected) return;
    
    this.socket.emit('typing', { chatId, isTyping });
  }

  // Disconnect socket - only used when user logs out
  public disconnect(): void {
    if (this.socket) {
      // Clear active rooms first
      this.activeRooms.clear();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
      this.currentChatId = null;
    }
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService; 