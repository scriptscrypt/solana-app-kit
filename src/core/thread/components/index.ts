// src/components/thread/index.ts
import Thread from './thread-container/Thread';
import ThreadItem from './thread-item/ThreadItem';
import ThreadAncestors from './thread-ancestors/ThreadAncestors';
import ThreadComposer from './thread-composer/ThreadComposer';
import ThreadEditModal from './ThreadEditModal';
import EditPostModal from './EditPostModal';
import NftListingModal from '../../../modules/nft/components/NftListingModal';
import PostBody from './post/PostBody';
import PostCTA from './post/PostCTA';
import PostFooter from './post/PostFooter';
import PostHeader from './post/PostHeader';

// Default exports to maintain backward compatibility
export {
  Thread,
  ThreadItem,
  ThreadAncestors,
  ThreadComposer,
  ThreadEditModal,
  EditPostModal,
  NftListingModal,
  PostBody,
  PostCTA,
  PostFooter,
  PostHeader,
};

// Re-export style utilities
export * from './thread.theme';
export * from './thread.styles';

// Note: We don't re-export thread.types.ts or thread.utils.ts because
// those have been moved to their respective directories
