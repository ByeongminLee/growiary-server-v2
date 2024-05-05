import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ChallengeService } from './challenge.service';
import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { UserDTO } from 'src/users/users.dto';

@Controller('challenge')
export class ChallengeController {
  constructor(
    @Inject(REQUEST) private readonly request: { user: UserDTO },
    private readonly challengeService: ChallengeService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async userChallenge() {
    // 유저의 도전과제 반환
    // 얻을 수 있는 도전과제 체크후 업데이트후 반환
    const data = await this.challengeService.challenge();
    return { message: 'challenge', data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('badge')
  async badge() {
    const data = this.challengeService.userBadgeList();
    return { message: 'badge list', data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('rank')
  async challengeRank() {
    // 전체 유저수와 해당 유저의 등수를 반환
    // 상위 몇 %인지 계산해야함
    const { uid } = this.request.user;
    const data = this.challengeService.challengeRank({ userId: uid });
    return { message: 'rank', data };
  }
}
