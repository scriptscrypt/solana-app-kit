
import {ThreadPost} from './thread.types';

export function buildThreadTree(flatPosts: ThreadPost[]): ThreadPost[] {
  const map = new Map<string, ThreadPost>();

  // Clone each post and initialize `replies` array
  flatPosts.forEach(post => map.set(post.id, {...post, replies: []}));

  const rootPosts: ThreadPost[] = [];

  // Link replies to their parent
  map.forEach((post, postId) => {
    if (post.parentId) {
      const parent = map.get(post.parentId);
      if (parent && parent.replies) {
        parent.replies.push(post);
      }
    } else {
      // No parent => top-level post
      rootPosts.push(post);
    }
  });

  return rootPosts;
}

export function flattenThreadTree(posts: ThreadPost[]): ThreadPost[] {
  const result: ThreadPost[] = [];

  function dfs(post: ThreadPost) {
    const {replies, ...rest} = post;
    result.push({...rest});

    if (replies && replies.length) {
      replies.forEach(r => dfs(r));
    }
  }

  posts.forEach(p => dfs(p));
  return result;
}

export function getParentChain(
  flatPosts: ThreadPost[],
  postId: string,
): ThreadPost[] {
  const map = new Map<string, ThreadPost>();
  flatPosts.forEach(p => map.set(p.id, p));

  const chain: ThreadPost[] = [];
  let current = map.get(postId);

  while (current?.parentId) {
    const parent = map.get(current.parentId);
    if (!parent) break;
    chain.unshift(parent);
    current = parent;
  }

  return chain;
}