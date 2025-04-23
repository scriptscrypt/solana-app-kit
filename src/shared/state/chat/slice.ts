import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { SERVER_URL } from '@env';

// Types
export interface ChatParticipant {
  id: string;
  username: string;
  profile_picture_url: string | null;
  is_admin?: boolean;
}

export interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  content: string;
  image_url?: string | null;
  additional_data?: any;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    username: string;
    profile_picture_url: string | null;
  };
}

export interface ChatRoom {
  id: string;
  type: 'direct' | 'group' | 'global';
  name: string | null;
  meta_data?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  participants: ChatParticipant[];
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

// State interface
interface ChatState {
  chats: ChatRoom[];
  messages: Record<string, ChatMessage[]>;
  selectedChatId: string | null;
  usersForChat: ChatParticipant[];
  loadingChats: boolean;
  loadingMessages: boolean;
  loadingUsers: boolean;
  error: string | null;
}

// Initial state
const initialState: ChatState = {
  chats: [],
  messages: {},
  selectedChatId: null,
  usersForChat: [],
  loadingChats: false,
  loadingMessages: false,
  loadingUsers: false,
  error: null,
};

// Async Thunks
export const fetchUserChats = createAsyncThunk(
  'chat/fetchUserChats',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/chat/users/${userId}/chats`);
      return response.data.chats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch chats');
    }
  }
);

export const fetchChatMessages = createAsyncThunk(
  'chat/fetchChatMessages',
  async ({ chatId, limit = 50, before = '' }: { chatId: string; limit?: number; before?: string }, { rejectWithValue }) => {
    try {
      const url = `${SERVER_URL}/api/chat/chats/${chatId}/messages${before ? `?before=${before}&limit=${limit}` : `?limit=${limit}`}`;
      const response = await axios.get(url);
      return { chatId, messages: response.data.messages };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ 
    chatId, 
    userId, 
    content, 
    imageUrl,
    additionalData 
  }: { 
    chatId: string; 
    userId: string; 
    content: string; 
    imageUrl?: string;
    additionalData?: any 
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${SERVER_URL}/api/chat/messages`, {
        chatId,
        userId,
        content,
        imageUrl,
        additionalData,
      });
      return response.data.message;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send message');
    }
  }
);

export const createDirectChat = createAsyncThunk(
  'chat/createDirectChat',
  async ({ userId, otherUserId }: { userId: string; otherUserId: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${SERVER_URL}/api/chat/direct`, {
        userId,
        otherUserId,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create chat');
    }
  }
);

export const createGroupChat = createAsyncThunk(
  'chat/createGroupChat',
  async ({ name, userId, participantIds }: { name: string; userId: string; participantIds: string[] }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${SERVER_URL}/api/chat/group`, {
        name,
        userId,
        participantIds,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create group chat');
    }
  }
);

export const fetchUsersForChat = createAsyncThunk(
  'chat/fetchUsersForChat',
  async ({ query, userId }: { query?: string; userId?: string }, { rejectWithValue }) => {
    try {
      let url = `${SERVER_URL}/api/chat/users`;
      const params = [];
      
      if (query) params.push(`query=${encodeURIComponent(query)}`);
      if (userId) params.push(`userId=${encodeURIComponent(userId)}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await axios.get(url);
      return response.data.users;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch users');
    }
  }
);

// Create slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedChat: (state, action) => {
      // When setting a selected chat, reset its unread count
      const prevSelectedChatId = state.selectedChatId;
      state.selectedChatId = action.payload;
      
      if (action.payload) {
        const chatIndex = state.chats.findIndex(chat => chat.id === action.payload);
        if (chatIndex !== -1) {
          state.chats[chatIndex].unreadCount = 0;
        }
      }
    },
    receiveMessage: (state, action) => {
      const message = action.payload;
      // Extract the _meta property if present, and clean the message object
      const meta = message._meta;
      const cleanMessage = {...message};
      if (cleanMessage._meta) {
        delete cleanMessage._meta; // Remove _meta from the stored message
      }
      
      if (state.messages[cleanMessage.chat_room_id]) {
        // Check if this message is already in the array to avoid duplicates
        const isDuplicate = state.messages[cleanMessage.chat_room_id].some(m => m.id === cleanMessage.id);
        if (!isDuplicate) {
          state.messages[cleanMessage.chat_room_id].push(cleanMessage);
        }
      } else {
        state.messages[cleanMessage.chat_room_id] = [cleanMessage];
      }
      
      // Update last message in chat list
      const chatIndex = state.chats.findIndex(chat => chat.id === cleanMessage.chat_room_id);
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = cleanMessage;
        
        // If the chat isn't currently selected and the message is not from the current user,
        // increment unread count only if we're not duplicating a message
        const currentUserId = meta?.currentUserId;
        if (state.selectedChatId !== cleanMessage.chat_room_id && 
            currentUserId && cleanMessage.sender_id !== currentUserId &&
            !state.messages[cleanMessage.chat_room_id].some(m => m.id === cleanMessage.id)) {
          state.chats[chatIndex].unreadCount = (state.chats[chatIndex].unreadCount || 0) + 1;
        }
      }
    },
    updateUnreadCount: (state, action) => {
      const { chatId, increment, reset } = action.payload;
      const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
      
      if (chatIndex !== -1) {
        if (reset) {
          // Reset unread count for the chat
          state.chats[chatIndex].unreadCount = 0;
        } else if (increment) {
          // Increment unread count
          state.chats[chatIndex].unreadCount = (state.chats[chatIndex].unreadCount || 0) + 1;
        }
      }
    },
    clearChatErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch user chats
    builder
      .addCase(fetchUserChats.pending, (state) => {
        state.loadingChats = true;
        state.error = null;
      })
      .addCase(fetchUserChats.fulfilled, (state, action) => {
        state.loadingChats = false;
        state.chats = action.payload;
      })
      .addCase(fetchUserChats.rejected, (state, action) => {
        state.loadingChats = false;
        state.error = action.payload as string;
      })
      
    // Fetch chat messages
    builder
      .addCase(fetchChatMessages.pending, (state) => {
        state.loadingMessages = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;
        const { chatId, messages } = action.payload;
        state.messages[chatId] = messages;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload as string;
      })
      
    // Send message
    builder
      .addCase(sendMessage.fulfilled, (state, action) => {
        const message = action.payload;
        
        if (state.messages[message.chat_room_id]) {
          // Check if message is already in the array
          const isDuplicate = state.messages[message.chat_room_id].some(m => m.id === message.id);
          if (!isDuplicate) {
            state.messages[message.chat_room_id].push(message);
          }
        } else {
          state.messages[message.chat_room_id] = [message];
        }
        
        // Update last message in chat list
        const chatIndex = state.chats.findIndex(chat => chat.id === message.chat_room_id);
        if (chatIndex !== -1) {
          state.chats[chatIndex].lastMessage = message;
          
          // For sent messages, don't increment unread count since they're from the current user
        }
      })
      
    // Fetch users for chat
    builder
      .addCase(fetchUsersForChat.pending, (state) => {
        state.loadingUsers = true;
      })
      .addCase(fetchUsersForChat.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.usersForChat = action.payload;
      })
      .addCase(fetchUsersForChat.rejected, (state, action) => {
        state.loadingUsers = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedChat, receiveMessage, updateUnreadCount, clearChatErrors } = chatSlice.actions;
export default chatSlice.reducer; 