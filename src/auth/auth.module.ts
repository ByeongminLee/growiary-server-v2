import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import config from 'src/config';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersRepository } from 'src/users/users.repository';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { ProfileRepository } from 'src/profile/profile.repository';
import { ChallengeRepository } from 'src/challenge/challenge.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: config.JWT_SECRET_ACCESS_KEY,
        signOptions: { expiresIn: config.JWT_EXPIRES_IN },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    KakaoStrategy,
    JwtStrategy,
    UsersRepository,
    ProfileRepository,
    ChallengeRepository,
  ],
})
export class AuthModule {}
