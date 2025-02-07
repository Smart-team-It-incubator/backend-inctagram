export interface ICommentInterface {
    id: string;
    text: string;
    createdAt: Date;
    author: string;
    userId: string;
    postId: string;
}
export class CommentViewModel implements ICommentInterface {
    id: string;
    text: string;
    createdAt: Date;
    author: string;
    userId: string;
    postId: string;
    constructor(comment: ICommentInterface) {
        this.id = comment.id;
        this.text = comment.text;
        this.createdAt = comment.createdAt // Преобразуем Date в ISO-строку
        this.author = comment.author;
        this.userId = comment.userId;
        this.postId = comment.postId;
    }
}

export class Comment implements ICommentInterface {
    id: string;
    text: string;
    createdAt: Date;
    author: string;
    userId: string;
    postId: string;
    constructor(comment: ICommentInterface) {
        this.id = comment.id;
        this.text = comment.text;
        this.createdAt = comment.createdAt // Преобразуем Date в ISO-строку
        this.author = comment.author;
        this.userId = comment.userId;
        this.postId = comment.postId;
    }
}