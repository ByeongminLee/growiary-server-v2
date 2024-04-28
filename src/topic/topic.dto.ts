import { Timestamp } from 'firebase-admin/firestore';

export interface TopicDTO {
  id: number;
  title: string;
  category: string;
  content: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  status: boolean;
}

export interface CreateTopicDTO {
  title: string;
  category: string;
  content: string;
}

export interface UpdateTopicDTO {
  id: number;
  title?: string;
  category?: string;
  content?: string;
  status?: boolean;
}
