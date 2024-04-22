import { Injectable } from '@nestjs/common';
import { firestore } from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersRepository {
  constructor() {}

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

  async setCurrentRefreshToken({
    userId,
    currentRefreshToken,
  }: {
    userId: any;
    currentRefreshToken: any;
  }): Promise<any> {
    const prevUserData = await this.getUser({ userId });
    const userDoc = await firestore().collection('users').doc(prevUserData.uid);

    const userData = await {
      ...prevUserData,
      refreshToken: currentRefreshToken,
    };

    await userDoc.update(userData, { merge: true });

    return;
  }

  async logout(userId: any): Promise<any> {
    const prevUserData = await this.getUser({ userId });
    const userDoc = await firestore().collection('users').doc(prevUserData.uid);

    const userData = {
      ...prevUserData,
      refreshToken: null,
    };

    await userDoc.update(userData, { merge: true });

    return;
  }
}
