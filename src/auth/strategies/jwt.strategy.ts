import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Payload } from 'src/auth/auth.interface';
import config from 'src/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.JWT_SECRET_ACCESS_KEY,
    });
  }

  async validate(payload: Payload) {
    return { userId: payload.userId };
  }
}
