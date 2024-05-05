import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { UsersRepository } from 'src/users/users.repository';
import { PostFilterService } from 'src/post/postFilter.service';
import { ProfileRepository } from 'src/profile/profile.repository';
import { JwtService } from '@nestjs/jwt';
import { FeedbackRepository } from './feedback.repository';

@Module({
  controllers: [FeedbackController],
  providers: [
    FeedbackService,
    FeedbackRepository,
    JwtAuthGuard,
    AuthService,
    UsersRepository,
    PostFilterService,
    ProfileRepository,
    FeedbackRepository,
    JwtService,
  ],
})
export class FeedbackModule {}
