import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {

    const secretOrKey = configService.get<string>('JWT_SECRET');
    if (!secretOrKey) {
      throw new Error('JWT_SECRET is not set in the environment variables');
    }

    super({
      // If using header token:
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // If using cookies, you can extract from request cookies:
      // jwtFromRequest: (req) => req?.cookies?.accessToken,
      ignoreExpiration: false,
      secretOrKey,
      passReqToCallback: true,
    });
  }

  validate(payload: any) {
    return { userId: payload.sub, email: payload.email, roles: payload.roles };
  }
}
