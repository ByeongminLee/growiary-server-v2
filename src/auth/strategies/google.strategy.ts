import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import config from 'src/config';

export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: `${config.BACKEND_URL}/${process.env.FUNCTION_TARGET}/auth/google`,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any, info?: any) => void,
  ) {
    try {
      const { id, emails } = profile;
      const user = {
        userId: id,
        email: emails[0].value,
        nickname: profile.displayName || '',
        profileImage: profile.photos[0].value || '',
      };
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
