import { Injectable } from '@nestjs/common';
import { firestore } from 'firebase-admin';

@Injectable()
export class ChallengeRepository {
  constructor() {}

  async getBadge(userId: string): Promise<any | 'NOT_FOUND'> {
    const badge = await firestore().collection('badge').doc(userId).get();

    if (!badge.exists) {
      return 'NOT_FOUND';
    }
    const data = badge.data();

    const badgeList = Object.keys(data).reduce((acc, key) => {
      const badge = data[key];
      if (badge.acquiredDate) {
        acc[key] = {
          ...badge,
          acquiredDate: badge.acquiredDate.toDate(),
        };
      } else {
        acc[key] = badge;
      }
      return acc;
    }, {});

    return badgeList;
  }

  async allUserBadge() {
    const badge = await firestore().collection('badge').get();

    if (badge.empty) {
      return [];
    }

    const badgeList = badge.docs.map((doc) => {
      const data = doc.data();
      const badgeList = Object.keys(data).reduce((acc, key) => {
        const badge = data[key];
        if (badge.acquiredDate) {
          acc[key] = {
            ...badge,
            acquiredDate: badge.acquiredDate.toDate(),
          };
        } else {
          acc[key] = badge;
        }
        return acc;
      }, {});

      return badgeList;
    });

    return badgeList;
  }

  async create({
    userId,
    registerDate,
  }: {
    userId: string;
    registerDate: Date;
  }) {
    // 기본적으로 가입과 동시에 추가되는 뱃지
    const baseBadge = {
      first: {
        key: 'first',
        name: '설레는 첫 만남',
        acquired: true,
        acquiredDate: registerDate,
      },
    };

    const firstBadge = firestore().collection('badge').doc(userId);

    await firstBadge.set(baseBadge, { merge: true });

    return baseBadge;
  }

  async update({ userId, badgeList }: { userId: string; badgeList: object }) {
    const badgeDoc = await firestore().collection('badge').doc(userId);

    await badgeDoc.set(badgeList, { merge: true });
  }
}
