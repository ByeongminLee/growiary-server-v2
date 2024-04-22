import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';
import config from 'src/config';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientID: config.KAKAO_CLIENT_ID,
      clientSecret: config.KAKAO_CLIENT_SECRET,
      callbackURL: `${config.BACKEND_URL}/auth/kakao`,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ) {
    try {
      const { _json } = profile;
      const user = {
        userId: _json.id.toString(),
        email: _json?.kakao_account?.email || '',
      };
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
