/* eslint-disable prettier/prettier */
import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '@/users/service/users.service';
import { CryptoService } from '@/utils/crypto/crypto';
import * as bcrypt from 'bcrypt';
import { User } from '@/utils/typeorm/User.entity';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private cryptoService: CryptoService,
  ) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string) {
    let user: User;
    let isMatch: boolean = false;
    try {
      user = await this.usersService.getUserByEmail(email, 'email');
    } catch (error) {
      throw new BadGatewayException();
    }

    if (!user) throw new NotFoundException();

    try {
      const passDecrypted = await this.cryptoService.decrypt(password);
      isMatch = await bcrypt.compare(passDecrypted, user.passwordHashed);
    } catch (error) {
      throw new BadGatewayException();
    }

    if (!isMatch) throw new UnauthorizedException();

    return user;
  }
}
