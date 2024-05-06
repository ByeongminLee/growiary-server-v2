import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { UserDTO } from 'src/users/users.dto';
import { ChallengeRepository } from './challenge.repository';
import { BadgeService } from './badge.service';
import { ProfileService } from 'src/profile/profile.service';

@Injectable()
export class ChallengeService {
  constructor(
    @Inject(REQUEST) private readonly request: { user: UserDTO },
    private readonly challengeRepository: ChallengeRepository,
    private readonly badgeService: BadgeService,
    private readonly profileService: ProfileService,
  ) {}

  async challenge() {
    const { uid, createdAt } = this.request.user;
    const registerDate =
      createdAt instanceof Date ? createdAt : createdAt.toDate();

    // 1. 유저의 뱃지 가져오기
    let badgeList = await this.challengeRepository.getBadge(uid);
    // 2. 뱃지 컬렉션이 없다면 뱃지 컬렉션 생성
    if (badgeList === 'NOT_FOUND') {
      badgeList = await this.challengeRepository.create({
        userId: uid,
        registerDate,
      });
    }
    // 3. 현재 가지고 있지 않는 뱃지를 얻을 수 있는지 확인 후 추가
    const updatedBadge = await this.badgeService.badgeCheck({
      currentBadge: badgeList,
      userId: uid,
    });

    // 3.1. 뱃지 정보 업데이트
    await this.challengeRepository.update({
      userId: uid,
      badgeList: updatedBadge,
    });

    // 4. 나의 랭크 반환
    const { myBadge, totalUser, myRank } = await this.challengeRank({
      userId: uid,
    });

    const { titleBadge } = await this.profileService.getProfile();

    // 5. 뱃지 정보와 랭크 반환
    return { titleBadge, myBadge, totalUser, myRank };
  }

  async userBadgeList() {
    const { uid } = this.request.user;
    return await this.challengeRepository.getBadge(uid);
  }

  // 전체 badgeList에서 가지고 있는 badge수를 비교하여 나의 rank와 전체 유저를 반환
  async challengeRank({ userId }: { userId: string }) {
    const badgeList = await this.challengeRepository.allUserBadge();
    const myBadge = await this.challengeRepository.getBadge(userId);

    if (myBadge === 'NOT_FOUND') {
      return { totalUser: badgeList.length, myRank: badgeList.length };
    }

    const myBadgeCount = await Object.keys(myBadge).length;
    const rank = await badgeList.filter((badge) => {
      const badgeCount = Object.keys(badge).length;
      return myBadgeCount < badgeCount;
    });

    return { totalUser: badgeList.length, myRank: rank.length + 1, myBadge };
  }
}
