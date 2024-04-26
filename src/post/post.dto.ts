import { Timestamp } from 'firebase-admin/firestore';

interface Post {
  topicId?: string;
  title: string;
  writeDate: Date;
  tags: string[];
  content: any;
  charactersCount: number;
}

export interface PostDTO extends Post {
  id: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface CreatePostDTO extends Post {}

export interface UpdatePostDTO {
  id: string;
  title?: string;
  topicId?: string;
  writeDate?: Date;
  charactersCount?: number;
  tags?: string[];
  content?: any;
}
