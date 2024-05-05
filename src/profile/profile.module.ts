import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { UsersRepository } from 'src/users/users.repository';
import { PostFilterService } from 'src/post/postFilter.service';
import { ProfileRepository } from './profile.repository';
import { ChallengeRepository } from 'src/challenge/challenge.repository';

@Module({
  controllers: [ProfileController],
  providers: [
    ProfileService,
    JwtService,
    JwtAuthGuard,
    AuthService,
    UsersRepository,
    PostFilterService,
    ProfileRepository,
    ChallengeRepository,
  ],
})
export class ProfileModule {}
