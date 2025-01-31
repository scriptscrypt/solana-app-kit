export interface ThreadPost {
  id: string;
  parentId?: string;
  content: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string;
  };
  createdAt: string;
  replies?: ThreadPost[];
}
