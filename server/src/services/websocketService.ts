/**
 * File: server/src/services/websocketService.ts
 * 
 * WebSocket service for real-time chat:
 * - Connect/disconnect handling
 * - Join/leave chat rooms
 * - Send/receive messages
 * - Typing indicators
 */
import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';

// Interface for chat message
interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  additionalData?: any;
  timestamp: Date;
  sender?: {
    id: string;
    username: string;
    profilePictureUrl?: string;
  };
}

// Main WebSocket service class
export class WebSocketService {
  private io: SocketServer;
  private userSocketMap: Map<string, string[]> = new Map(); // userId -> socketIds[]
  private socketUserMap: Map<string, string> = new Map(); // socketId -> userId

  constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: '*', // For development; should be restricted in production
        methods: ['GET', 'POST'],
      },
    });

    this.initializeEventHandlers();
    console.log('WebSocket service initialized');
  }

  /**
   * Initialize Socket.IO event handlers
   */
  private initializeEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`New socket connection: ${socket.id}`);

      // Authenticate user on connect
      socket.on('authenticate', (data: { userId: string }) => {
        this.handleAuthentication(socket, data.userId);
      });

      // Join a chat room
      socket.on('join_chat', (data: { chatId: string }) => {
        this.joinChat(socket, data.chatId);
      });

      // Leave a chat room
      socket.on('leave_chat', (data: { chatId: string }) => {
        this.leaveChat(socket, data.chatId);
      });

      // Handle chat message
      socket.on('send_message', (data: ChatMessage) => {
        this.handleChatMessage(socket, data);
      });

      // Handle typing indicator
      socket.on('typing', (data: { chatId: string, isTyping: boolean }) => {
        this.handleTypingIndicator(socket, data);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  /**
   * Handle user authentication
   */
  private handleAuthentication(socket: Socket, userId: string): void {
    console.log(`Authenticating user: ${userId} for socket: ${socket.id}`);
    
    // Store mapping of socket to user
    this.socketUserMap.set(socket.id, userId);
    
    // Store mapping of user to sockets (a user can have multiple active connections)
    const userSockets = this.userSocketMap.get(userId) || [];
    userSockets.push(socket.id);
    this.userSocketMap.set(userId, userSockets);
    
    // Acknowledge successful authentication
    socket.emit('authenticated', { success: true });
    
    console.log(`User ${userId} authenticated with socket ${socket.id}`);
  }

  /**
   * Handle joining a chat room
   */
  private joinChat(socket: Socket, chatId: string): void {
    const userId = this.socketUserMap.get(socket.id);
    if (!userId) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }
    
    // Join the socket.io room for this chat
    socket.join(`chat:${chatId}`);
    console.log(`User ${userId} joined chat room: ${chatId}`);
    
    // Notify other participants that this user joined
    socket.to(`chat:${chatId}`).emit('user_joined', {
      chatId,
      userId,
    });
  }

  /**
   * Handle leaving a chat room
   */
  private leaveChat(socket: Socket, chatId: string): void {
    const userId = this.socketUserMap.get(socket.id);
    if (!userId) return;
    
    // Leave the socket.io room
    socket.leave(`chat:${chatId}`);
    console.log(`User ${userId} left chat room: ${chatId}`);
    
    // Notify other participants
    socket.to(`chat:${chatId}`).emit('user_left', {
      chatId,
      userId,
    });
  }

  /**
   * Handle chat message
   */
  private handleChatMessage(socket: Socket, message: ChatMessage): void {
    const userId = this.socketUserMap.get(socket.id);
    if (!userId) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }
    
    if (userId !== message.senderId) {
      socket.emit('error', { message: 'Sender ID mismatch' });
      return;
    }
    
    // Broadcast message to all users in the chat room
    this.io.to(`chat:${message.chatId}`).emit('new_message', message);
    
    console.log(`Message sent in chat ${message.chatId} by user ${userId}`);
  }

  /**
   * Handle typing indicator
   */
  private handleTypingIndicator(socket: Socket, data: { chatId: string, isTyping: boolean }): void {
    const userId = this.socketUserMap.get(socket.id);
    if (!userId) return;
    
    // Broadcast typing status to other users in the chat
    socket.to(`chat:${data.chatId}`).emit('user_typing', {
      chatId: data.chatId,
      userId,
      isTyping: data.isTyping,
    });
  }

  /**
   * Handle socket disconnect
   */
  private handleDisconnect(socket: Socket): void {
    const userId = this.socketUserMap.get(socket.id);
    if (!userId) return;
    
    console.log(`User ${userId} disconnected from socket ${socket.id}`);
    
    // Remove socket from user's socket list
    const userSockets = this.userSocketMap.get(userId) || [];
    const updatedSockets = userSockets.filter(id => id !== socket.id);
    
    if (updatedSockets.length > 0) {
      this.userSocketMap.set(userId, updatedSockets);
    } else {
      // If no sockets left, remove user entirely
      this.userSocketMap.delete(userId);
    }
    
    // Remove socket from socket-user map
    this.socketUserMap.delete(socket.id);
  }

  /**
   * Public method to broadcast a message to a specific chat room
   * Used by external services to send system messages or notifications
   */
  public broadcastToChatRoom(chatId: string, event: string, data: any): void {
    this.io.to(`chat:${chatId}`).emit(event, data);
  }

  /**
   * Public method to send a direct message to a specific user
   * Used by external services to send notifications
   */
  public sendToUser(userId: string, event: string, data: any): void {
    const userSockets = this.userSocketMap.get(userId) || [];
    
    userSockets.forEach(socketId => {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit(event, data);
      }
    });
  }
} 