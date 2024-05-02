import { Timestamp } from 'firebase-admin/firestore';

export interface ProfileDTO {
  userId: string;
  nickname: string;
  profileImage: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface CreateProfileDTO {
  userId: string;
  nickname: string;
  profileImage: string;
}
