import { Timestamp } from 'firebase-admin/firestore';

export interface FeedbackDTO {
  id: string;
  userId: string;
  category: string;
  content: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface CreateFeedbackDTO {
  category: string;
  content: string;
}
