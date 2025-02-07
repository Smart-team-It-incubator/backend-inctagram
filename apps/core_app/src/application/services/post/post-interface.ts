export interface IPostInterface {
    id: string;
    text: string | null;
    location: string | null;
    createdAt: Date;
    userId: string;
    author: string;
    photos: { id: string; url: string; photoDescription: string | null }[];
  }
  
  //TODO ДОбавить в сваггер
  export class PostViewModel {
    id: string;
    text: string | null;
    location: string | null;
    createdAt: string; // Дата в виде строки (ISO-формат)
    userId: string;
    author: string;
    photos: { id: string; url: string; photoDescription: string | null }[];
  
    constructor(post: IPostInterface) {
      this.id = post.id;
      this.text = post.text;
      this.location = post.location;
      this.createdAt = post.createdAt.toISOString(); // Преобразуем Date в ISO-строку
      this.userId = post.userId;
      this.photos = post.photos;
      this.author = post.author;
    }
  
    getPublicVersion(): Partial<PostViewModel> {
      return {
        id: this.id,
        text: this.text,
        location: this.location,
        createdAt: this.createdAt,
        userId: this.userId,
        author: this.author || null,
        photos: this.photos.map(photo => ({ id: photo.id, url: photo.url, photoDescription: photo.photoDescription })),
      };
    }
  }