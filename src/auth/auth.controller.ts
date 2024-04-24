import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response, CookieOptions } from 'express';
import config from 'src/config';
import { UserDTO } from 'src/users/users.dto';
import { decrypt, encrypt } from 'src/utils/crypt';
import { getClientUrl } from 'src/utils/environment';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  cookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
    domain: config.COOKIE_DOMAIN,
  };

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin(
    @Req() req: Request & { user: UserDTO },
    @Res() res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.socialLogin({
      userId: req.user.userId,
      email: req.user.email,
      social: 'kakao',
    });

    res.cookie('accessToken', accessToken, this.cookieOptions);
    res.cookie('refreshToken', refreshToken, this.cookieOptions);

    const key = encrypt(
      `{"accessToken":"${accessToken}","refreshToken":"${refreshToken}"}`,
    );

    return res.redirect(`${getClientUrl(req)}/login?key=${key}`);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(
    @Req() @Req() req: Request & { user: UserDTO },
    @Res() res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.socialLogin({
      userId: req.user.userId,
      email: req.user.email,
      social: 'google',
    });

    res.cookie('accessToken', accessToken, this.cookieOptions);
    res.cookie('refreshToken', refreshToken, this.cookieOptions);

    const key = encrypt(
      `{"accessToken":"${accessToken}","refreshToken":"${refreshToken}"}`,
    );

    return res.redirect(`${getClientUrl(req)}/login?key=${key}`);
  }

  @Get('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    try {
      const newAccessToken = await this.authService.refresh(
        req.cookies?.refreshToken,
      );
      res.cookie('accessToken', newAccessToken, this.cookieOptions);

      return res.send();
    } catch (err) {
      res.clearCookie('accessToken', this.cookieOptions);
      res.clearCookie('refreshToken', this.cookieOptions);

      throw new UnauthorizedException();
    }
  }

  @Post('refresh')
  async refreshPost(@Req() req: Request) {
    const { key } = JSON.parse(req.body);
    const token = decrypt(key);
    try {
      const newAccessToken = await this.authService.refresh(token);

      return {
        message: 'Success refresh token',
        key: encrypt(newAccessToken),
      };
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  // @UseGuards(AuthGuard('jwt'))
  // @Get('logout')
  // async logout(@Req() req: Request & { user: UserDTO }, @Res() res: Response) {
  //   res.clearCookie('accessToken', this.cookieOptions);
  //   res.clearCookie('refreshToken', this.cookieOptions);

  //   await this.authService.logout(req.user.userId);

  //   return res.redirect(config.CLIENT_URL);
  // }

  @Post('logout')
  async logoutPost(@Req() req: Request) {
    const { key } = JSON.parse(req.body);
    const token = decrypt(key);

    await this.authService.logout(token);

    return {
      message: 'Success logout',
    };
  }
}
