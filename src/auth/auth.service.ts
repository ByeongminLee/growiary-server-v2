import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Payload } from './auth.interface';
import * as bcrypt from 'bcryptjs';
import config from 'src/config';
import { UsersRepository } from 'src/users/users.repository';
import { AuthDTO, SocialLoginDTO } from 'src/users/users.dto';
import { ProfileRepository } from 'src/profile/profile.repository';
// import { UserDTO } from 'src/users/users.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly profileRepository: ProfileRepository,
  ) {}

  async socialLogin(
    socialLoginDTO: SocialLoginDTO,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.validateUser(socialLoginDTO);
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  async validateUser(socialLoginDTO: SocialLoginDTO): Promise<any> {
    let user: any = await this.usersRepository.getUser({
      userId: socialLoginDTO.userId,
    });
    if (!user) {
      user = await this.usersRepository.create({
        userId: socialLoginDTO.userId,
        email: socialLoginDTO.email,
        social: socialLoginDTO.social,
      });

      await this.profileRepository.create({
        userId: user.uid,
        nickname: socialLoginDTO.nickname,
        profileImage: socialLoginDTO.profileImage,
      });
    }
    return user;
  }

  generateAccessToken(user: AuthDTO): string {
    const payload: Payload = {
      userId: user.userId,
    };
    return this.jwtService.sign(payload);
  }

  async generateRefreshToken(user: any): Promise<string> {
    const payload: Payload = {
      userId: user.userId,
    };

    const refreshToken = this.jwtService.sign(payload, {
      secret: config.JWT_REFRESH_SECRET,
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    });

    const currentRefreshToken = bcrypt.hashSync(refreshToken, 10);

    await this.usersRepository.setCurrentRefreshToken({
      userId: payload.userId,
      currentRefreshToken,
    });

    return refreshToken;
  }

  async tokenValidate(token: string): Promise<any> {
    return await this.jwtService.verify(token, {
      secret: config.JWT_SECRET_ACCESS_KEY,
    });
  }

  async refresh(refreshToken: string): Promise<string> {
    try {
      const decodedRefreshToken = this.jwtService.verify(refreshToken, {
        secret: config.JWT_REFRESH_SECRET,
      }) as Payload;
      const userId = decodedRefreshToken.userId;

      const user = await this.usersRepository.getUser({ userId });

      const isRefreshTokenMatching = bcrypt.compareSync(
        refreshToken,
        user.refreshToken,
      );

      if (!isRefreshTokenMatching) {
        throw new UnauthorizedException('Invalid refresh-token');
      }

      const accessToken = this.generateAccessToken(user);

      return accessToken;
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh-token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    const decodedRefreshToken = this.jwtService.verify(refreshToken, {
      secret: config.JWT_REFRESH_SECRET,
    }) as Payload;
    const userId = decodedRefreshToken.userId;

    await this.usersRepository.logout(userId);
    return;
  }

  async testJwt() {
    const user = {
      userId: '117894279062888578060',
      email: '',
      nickname: '',
      profileImage: '',
    };
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }
}
