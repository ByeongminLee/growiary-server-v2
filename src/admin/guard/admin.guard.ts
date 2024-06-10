import {
  BadRequestException,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  constructor(
    private authService: AuthService,
    private usersRepository: UsersRepository,
  ) {
    super();
  }
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const { authorization } = request.headers;

    if (authorization === undefined) {
      throw new BadRequestException('토큰이 필요합니다.');
    }

    const token = authorization.replace('Bearer ', '');

    const tokenValidate = await this.validate(token);
    request.user = tokenValidate.user ? tokenValidate.user : tokenValidate;
    return true;
  }

  async validate(token: string) {
    try {
      const tokenVerify = await this.authService.tokenValidate(token);

      if (tokenVerify.userId) {
        const user = await this.usersRepository.getUser({
          userId: tokenVerify.userId,
        });

        if (user.role !== 'admin') {
          throw new BadRequestException('not admin user');
        }

        return user;
      } else {
        return tokenVerify;
      }
    } catch (error) {
      switch (error.message) {
        case 'invalid token':
          throw new BadRequestException('유효하지 않은 토큰입니다.');

        case 'invalid signature':
          throw new BadRequestException('유효하지 않은 토큰입니다.');

        case 'jwt expired':
          throw new BadRequestException('만료된 토큰입니다.');

        case 'not admin user':
          throw new BadRequestException('관리자만 접근 가능합니다.');

        default:
          throw new HttpException('서버 오류입니다.', 500);
      }
    }
  }
}
