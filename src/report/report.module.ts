import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { PostService } from 'src/post/post.service';
import { PostRepository } from 'src/post/post.repository';
import { PostFilterService } from 'src/post/postFilter.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import config from 'src/config';
import { UsersRepository } from 'src/users/users.repository';
import { AuthService } from 'src/auth/auth.service';
import { TopicRepository } from 'src/topic/topic.repository';
import { ProfileRepository } from 'src/profile/profile.repository';

@Module({
  controllers: [ReportController],
  providers: [
    ReportService,
    PostService,
    PostRepository,
    PostFilterService,
    UsersRepository,
    AuthService,
    JwtAuthGuard,
    TopicRepository,
    ProfileRepository,
  ],
  imports: [
    JwtModule.register({
      secret: config.JWT_SECRET_ACCESS_KEY,
      signOptions: { expiresIn: config.JWT_EXPIRES_IN },
    }),
  ],
})
export class ReportModule {}
