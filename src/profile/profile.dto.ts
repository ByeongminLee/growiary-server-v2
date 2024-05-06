import { Timestamp } from 'firebase-admin/firestore';
import { BadgeKeyName } from 'src/challenge/challenge.dto';

export interface ProfileDTO {
  userId: string;
  nickname: string;
  profileImage: string;
  email: string;
  social: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  titleBadge: BadgeKeyName;
}

export interface CreateProfileDTO {
  userId: string;
  nickname: string;
  profileImage: string;
  email: string;
  social: string;
}
