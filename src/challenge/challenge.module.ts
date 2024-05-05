import { Module } from '@nestjs/common';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { ChallengeRepository } from './challenge.repository';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { UsersRepository } from 'src/users/users.repository';
import { PostFilterService } from 'src/post/postFilter.service';
import { BadgeService } from './badge.service';
import { JwtService } from '@nestjs/jwt';
import { ProfileRepository } from 'src/profile/profile.repository';
import { PostRepository } from 'src/post/post.repository';
import { BadgePostService } from './badgePost.service';
import { TopicService } from 'src/topic/topic.service';
import { TopicRepository } from 'src/topic/topic.repository';
import { PostService } from 'src/post/post.service';

@Module({
  controllers: [ChallengeController],
  providers: [
    ChallengeService,
    BadgeService,
    ChallengeRepository,
    JwtService,
    JwtAuthGuard,
    AuthService,
    UsersRepository,
    PostFilterService,
    ProfileRepository,
    PostRepository,
    BadgePostService,
    TopicService,
    TopicRepository,
    PostService,
  ],
})
export class ChallengeModule {}
