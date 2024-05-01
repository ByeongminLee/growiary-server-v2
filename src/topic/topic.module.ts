import { Module } from '@nestjs/common';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { TopicRepository } from './topic.repository';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import config from 'src/config';
import { PostRepository } from 'src/post/post.repository';
import { PostFilterService } from 'src/post/postFilter.service';
import { PostService } from 'src/post/post.service';
import { UsersRepository } from 'src/users/users.repository';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [TopicController],
  providers: [
    TopicService,
    TopicRepository,
    AuthService,
    JwtAuthGuard,
    UsersRepository,
    PostRepository,
    PostService,
    PostFilterService,
    UsersService,
  ],
  imports: [
    JwtModule.register({
      secret: config.JWT_SECRET_ACCESS_KEY,
      signOptions: { expiresIn: config.JWT_EXPIRES_IN },
    }),
  ],
})
export class TopicModule {}
