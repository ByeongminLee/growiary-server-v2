import { Timestamp } from 'firebase-admin/firestore';

export interface UserDTO {
  userId: string;
  uid: string;
  email: string;
  role: 'admin' | 'user';
  social: 'kakao' | 'google';
  refreshToken?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface AuthDTO {
  userId: string;
  email: string;
}
