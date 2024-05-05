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

// export type TopicCategory = '하루생각' | '자아탐험' | '크리에이티브' | '회고';

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
