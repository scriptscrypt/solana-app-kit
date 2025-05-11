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

// Exporting components and types
export * from './thread-container/Thread';
export * from './thread-item/ThreadItem';
export * from './thread-composer/ThreadComposer';
export * from './post/PostHeader';
export * from './post/PostBody';
export * from './post/PostFooter';
export * from './post/PostCTA';
export * from './thread-ancestors/ThreadAncestors';
export * from './retweet/RetweetPreview';
export * from './trade/ShareTradeModal';
export * from './EditPostModal';

// Exporting individual section components
export * from './sections/SectionTextOnly';
export * from './sections/SectionTextImage';
export * from './sections/SectionTextVideo';
export * from './sections/SectionPoll';
export * from './sections/SectionTrade';
export * from './sections/SectionNftListing';

// Exporting types
export * from './thread.types';

// Exporting utility functions (if any)
export * from './thread.utils';

// Exporting style creation functions
export * from './thread.styles';
export * from './thread-composer/ThreadComposer.styles';
export * from './thread-ancestors/ThreadAncestors.styles';
export * from './post/PostHeader.styles';
export * from './post/PostBody.styles';
export * from './post/PostFooter.styles';
export * from './post/PostCTA.styles';
export * from './thread-item/ThreadItem.styles';

// Note: We don't re-export thread.types.ts or thread.utils.ts because
// those have been moved to their respective directories
