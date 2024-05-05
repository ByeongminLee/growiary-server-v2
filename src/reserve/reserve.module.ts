import { Module } from '@nestjs/common';
import { ReserveController } from './reserve.controller';
import { ReserveService } from './reserve.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { UsersRepository } from 'src/users/users.repository';
import { PostFilterService } from 'src/post/postFilter.service';
import { ProfileRepository } from 'src/profile/profile.repository';
import { JwtService } from '@nestjs/jwt';
import { ReserveRepository } from './reserve.repository';

@Module({
  controllers: [ReserveController],
  providers: [
    ReserveService,
    JwtAuthGuard,
    AuthService,
    UsersRepository,
    PostFilterService,
    ProfileRepository,
    ReserveRepository,
    JwtService,
  ],
})
export class ReserveModule {}
