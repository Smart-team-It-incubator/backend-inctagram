export interface ICommentInterface {
    id: string;
    text: string | null;
    createdAt: Date;
    userId: string;
    postId: string;
  }