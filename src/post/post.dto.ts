import { Timestamp } from 'firebase-admin/firestore';
import { TopicDTO } from 'src/topic/topic.dto';

interface Post {
  userId: string;
  topicId?: string;
  title: string;
  writeDate: Date;
  tags: string[];
  content: any;
  charactersCount: number;
}

export interface PostDTO extends Post {
  id: string;
  status: boolean;
  index: number;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface PostDTOWithTopic extends PostDTO {
  topic?: TopicDTO;
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
  status?: boolean;
}
