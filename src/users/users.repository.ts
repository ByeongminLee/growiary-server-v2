import { Injectable } from '@nestjs/common';
import { firestore } from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersRepository {
  constructor() {}

  /**
   * ㄴ유저 생성
   * @param userId 소셜 유저 아이디
   * @param email 메일 주소
   * @param social 가입한 소셜 서브시 (kakao, google)
   * @returns 가입한 유저 정보
   */
  async create({
    userId,
    email,
    social,
  }: {
    userId: string;
    email: string;
    social: 'kakao' | 'google';
  }): Promise<any> {
    const uid = uuidv4();
    const userDoc = await firestore().collection('users').doc(uid);

    const userData = {
      uid: uid,
      userId: userId,
      social: social,
      email: email,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await userDoc.set(userData, { merge: true });

    return userData;
  }

  /**
   * 유저 정보 반환
   * @param userId 소셜 유저 아이디
   * @param uid 유저 고유 아이디
   * @returns 유저 정보
   */
  async getUser({
    userId,
    uid,
  }: {
    userId?: string;
    uid?: string;
  }): Promise<any> {
    if (uid) {
      const userDoc = await firestore().collection('users').doc(uid).get();

      if (!userDoc.exists) {
        return undefined;
      }

      const userData = userDoc.data();
      return userData;
    } else if (userId) {
      const userDoc = await firestore()
        .collection('users')
        .where('userId', '==', userId)
        .get();

      if (userDoc.empty) {
        return undefined;
      }

      const userData = userDoc.docs[0].data();
      return userData;
    } else {
      return undefined;
    }
  }

  /**
   * 유저 refresh token 업데이트
   * @param userId 소셜 유저 아이디
   * @param currentRefreshToken 업데이트 할 refresh token
   */
  async setCurrentRefreshToken({
    userId,
    currentRefreshToken,
  }: {
    userId: string;
    currentRefreshToken: any;
  }): Promise<null> {
    const prevUserData = await this.getUser({ userId });
    const userDoc = await firestore().collection('users').doc(prevUserData.uid);

    const userData = await {
      ...prevUserData,
      refreshToken: currentRefreshToken,
    };

    await userDoc.update(userData, { merge: true });

    return;
  }

  /**
   * 로그아웃
   * @param userId 소셜 유저 아이디
   */
  async logout(userId: string): Promise<null> {
    const prevUserData = await this.getUser({ userId });
    const userDoc = await firestore().collection('users').doc(prevUserData.uid);

    const userData = {
      ...prevUserData,
      refreshToken: null,
    };

    await userDoc.update(userData, { merge: true });

    return;
  }

  /**
   * 유저 업데이트
   * @param userId 소셜 유저 아이디
   * @param role 유저 권한
   */
  async updateRole({
    userId,
    role,
  }: {
    userId: string;
    role: 'user' | 'admin';
  }): Promise<any> {
    const prevUserData = await this.getUser({ userId });
    const userDoc = await firestore().collection('users').doc(prevUserData.uid);

    const userData = {
      ...prevUserData,
      role: role,
    };

    await userDoc.update(userData, { merge: true });

    return userData;
  }

  /**
   * 전체 유저 수 반환
   * @returns 전체 유저 수
   */
  async allUserCount(): Promise<any> {
    const userDoc = await firestore().collection('users').get();
    return userDoc.size;
  }
}
