import { Timestamp } from 'firebase-admin/firestore';

export interface UserDTO {
  userId: string;
  uid: string;
  email: string;
  role: Role;
  social: Social;
  refreshToken?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export type Social = 'kakao' | 'google';

export type Role = 'admin' | 'user';

export interface AuthDTO {
  userId: string;
  email: string;
  nickname: string;
  profileImage: string;
}

export interface SocialLoginDTO {
  userId: string;
  email: string;
  social: 'kakao' | 'google';
  nickname: string;
  profileImage: string;
}
