import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { BadgeKeyName } from 'src/challenge/challenge.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfile() {
    return this.profileService.getProfile();
  }

  @UseGuards(JwtAuthGuard)
  @Post('title-badge')
  async profileTitleBadge(
    @Body() { titleBadge }: { titleBadge: BadgeKeyName },
  ) {
    const data = await this.profileService.profileTitleBadge(titleBadge);

    return { message: 'User title Badge setting successfully', data };
  }
}
