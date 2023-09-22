/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from "express";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
	Strategy,
	"jwtRefresh",
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtRefreshStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
    });
  }

  private static extractJWT(req: Request): string | null {
    if (
      req.cookies &&
      'refresh-token' in req.cookies &&
      req.cookies['refresh-token'].length > 0
    ) {
      return req.cookies['refresh-token'];
    }
    return null;
  }

  async validate(payload: any) {
    return { id: payload.sub, login: payload.login };
  }
}
