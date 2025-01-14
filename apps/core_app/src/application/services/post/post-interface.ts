export interface IPostInterface {
    id: number;
    text: string | null;
    location: string | null;
    createdAt: Date;
    userId: string;
  }
  
  export class PostViewModel {
    id: number;
    text: string | null;
    location: string | null;
    createdAt: string; // Дата в виде строки (ISO-формат)
    userId: string;
  
    constructor(post: IPostInterface) {
      this.id = post.id;
      this.text = post.text;
      this.location = post.location;
      this.createdAt = post.createdAt.toISOString(); // Преобразуем Date в ISO-строку
      this.userId = post.userId;
    }
  
    getPublicVersion(): Partial<PostViewModel> {
      return {
        id: this.id,
        text: this.text,
        location: this.location,
        createdAt: this.createdAt,
        userId: this.userId,
      };
    }
  }