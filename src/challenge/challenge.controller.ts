import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ChallengeService } from './challenge.service';

@Controller('challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async userChallenge() {
    return this.challengeService.challenge();
  }

  @UseGuards(JwtAuthGuard)
  @Get('badge')
  async badge() {
    return this.challengeService.userBadgeList();
  }

  async allChallenge() {
    // 전체 유저수와 해당 유저의 등수를 반환
    // 상위 몇 %인지 계산해야함
  }
}
