import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostRepository } from './post.repository';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { UsersRepository } from 'src/users/users.repository';
import { JwtModule } from '@nestjs/jwt';
import config from 'src/config';
import { PostFilterService } from './postFilter.service';
import { ProfileRepository } from 'src/profile/profile.repository';
import { ChallengeRepository } from 'src/challenge/challenge.repository';

@Module({
  controllers: [PostController],
  providers: [
    PostService,
    PostRepository,
    JwtAuthGuard,
    AuthService,
    UsersRepository,
    PostFilterService,
    ProfileRepository,
    ChallengeRepository,
  ],
  imports: [
    JwtModule.register({
      secret: config.JWT_SECRET_ACCESS_KEY,
      signOptions: { expiresIn: config.JWT_EXPIRES_IN },
    }),
  ],
})
export class PostModule {}
