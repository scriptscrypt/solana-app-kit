// src/state/thread/reducer.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {ImageSourcePropType} from 'react-native';
import { allposts } from '../../mocks/posts';
import { findPostById, generateId, removePostRecursive } from '../../components/thread/thread.utils';
import { ThreadPost, ThreadSection, ThreadUser } from '../../components/thread/thread.types';



interface ThreadState {
  allPosts: ThreadPost[];
}

const initialState: ThreadState = {
  allPosts: allposts,
};

export const threadSlice = createSlice({
  name: 'thread',
  initialState,
  reducers: {
    addRootPost: (
      state,
      action: PayloadAction<{
        user: ThreadUser;
        sections: ThreadSection[];
      }>,
    ) => {
      const newPost: ThreadPost = {
        id: generateId('post'),
        user: action.payload.user,
        parentId: undefined,
        sections: action.payload.sections,
        createdAt: new Date().toISOString(),
        replies: [],
        reactionCount: 0,
        retweetCount: 0,
        quoteCount: 0,
      };
      state.allPosts.push(newPost);
    },
    addReply: (
      state,
      action: PayloadAction<{
        parentId: string;
        user: ThreadUser;
        sections: ThreadSection[];
      }>,
    ) => {
      const {parentId, user, sections} = action.payload;
      const newReply: ThreadPost = {
        id: generateId('post'),
        user,
        parentId,
        sections,
        createdAt: new Date().toISOString(),
        replies: [],
        reactionCount: 0,
        retweetCount: 0,
        quoteCount: 0,
      };

      const parentPost = findPostById(state.allPosts, parentId);
      if (parentPost) {
        parentPost.replies.push(newReply);
        parentPost.quoteCount += 1;
      }
      state.allPosts.push(newReply);
    },
    deletePost: (state, action: PayloadAction<{postId: string}>) => {
      const {postId} = action.payload;
      const postToDelete = findPostById(state.allPosts, postId);
      if (!postToDelete) return;

      if (postToDelete.parentId) {
        const parentPost = findPostById(state.allPosts, postToDelete.parentId);
        if (parentPost) {
          parentPost.replies = parentPost.replies.filter(r => r.id !== postId);
          if (parentPost.quoteCount > 0) {
            parentPost.quoteCount -= 1;
          }
        }
      }

      state.allPosts = removePostRecursive(state.allPosts, postId);
    },
  },
});


export const {addRootPost, addReply, deletePost} = threadSlice.actions;
export default threadSlice.reducer;
