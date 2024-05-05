import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TopicService } from 'src/topic/topic.service';
import { PostService } from 'src/post/post.service';
import { PostRepository } from 'src/post/post.repository';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { UsersRepository } from 'src/users/users.repository';
import { ProfileRepository } from 'src/profile/profile.repository';
import { JwtService } from '@nestjs/jwt';
import { TopicRepository } from 'src/topic/topic.repository';
import { PostFilterService } from 'src/post/postFilter.service';
import { ChallengeRepository } from 'src/challenge/challenge.repository';

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    PostService,
    PostRepository,
    JwtAuthGuard,
    AuthService,
    UsersRepository,
    TopicService,
    ProfileRepository,
    JwtService,
    TopicRepository,
    PostFilterService,
    ChallengeRepository,
  ],
})
export class AdminModule {}
