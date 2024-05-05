import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { UserDTO } from 'src/users/users.dto';
import { ChallengeRepository } from './challenge.repository';
import { BadgeService } from './badge.service';

@Injectable()
export class ChallengeService {
  constructor(
    @Inject(REQUEST) private readonly request: { user: UserDTO },
    private readonly challengeRepository: ChallengeRepository,
    private readonly badgeService: BadgeService,
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
    const updateBadge = await this.badgeService.badgeCheck({
      currentBadge: badgeList,
      userId: uid,
    });

    // 4. 뱃지 정보 반환
    return updateBadge;
  }

  async userBadgeList() {
    const { uid } = this.request.user;
    return await this.challengeRepository.getBadge(uid);
  }
}
