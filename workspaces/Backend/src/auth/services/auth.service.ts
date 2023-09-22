/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import dataAPI42 from 'src/utils/interfaces/dataAPI42.interface';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/utils/typeorm/User.entity';
import { CreateUserDto } from 'src/users/dto/CreateUser.dto';
import { UsersService } from 'src/users/service/users.service';
import { CryptoService } from 'src/utils/crypto/crypto';
import { AvatarService } from 'src/avatar/service/avatar.service';
import { AvatarDto } from 'src/avatar/dto/Avatar.dto';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Avatar } from 'src/utils/typeorm/Avatar.entity';
import { Token } from 'src/utils/typeorm/Token.entity';
import { verify } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private avatarService: AvatarService,
    private jwtService: JwtService,
    private mailService: MailService,
    private cryptoService: CryptoService,
  ) {}

  async getToken42(code: string): Promise<dataAPI42> {
    const response = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.CLIENT_ID_42,
        client_secret: process.env.SECRET_42,
        code: code,
        redirect_uri: process.env.REDIRECT_42,
      }),
    });

    if (!response.ok) throw new Error('fetch failed');

    return await response.json();
  }

  async logUser(dataToken: dataAPI42): Promise<User> {
    const response = await fetch('https://api.intra.42.fr/v2/me', {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + dataToken.access_token },
    });

    if (!response.ok) throw new Error('Api 42 fetch error');

    const content = await response.json();

    const user: CreateUserDto = {
      email: await this.cryptoService.encrypt(content?.email),
      first_name: await this.cryptoService.encrypt(content?.login),
      last_name: await this.cryptoService.encrypt(content?.last_name),
      phone: await this.cryptoService.encrypt(content?.phone),
      image: await this.cryptoService.encrypt(content?.image?.versions.large),
      verified: true,
      provider: '42',
    };

    const user_old = await this.usersService.getUserByEmail(user.email, '42');
    if (!user_old) return await this.usersService.addUser(user);

    await this.usersService.updateUser(user_old.id, {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      image: user.image,
    });
    return user_old;
  }

  async login(
    user: User,
    nbOfRefreshes: number,
    isTwoFactorAuthenticationEnabled: boolean,
  ) {
    const payload = {
      sub: user.id,
      login: user.login,
      twoFactorAuth: isTwoFactorAuthenticationEnabled,
    };
    let access_token = '';
    let refresh_token = '';

    if (!isTwoFactorAuthenticationEnabled) {
      [access_token, refresh_token] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        }),
        this.jwtService.signAsync(payload, {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '1d',
        }),
      ]);

      try {
        await this.updateRefreshToken(user, refresh_token, nbOfRefreshes);
      } catch (error) {
        if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
          console.log(error);
      }
    } else
      access_token = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d',
      });

    return {
      access_token,
      refresh_token,
    };
  }

  private generateSecureCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = randomBytes(length);
    return Array.from(bytes, (byte) => chars[byte % chars.length]).join('');
  }

  async addUser(CreateUserDto: CreateUserDto) {
    try {
      
      CreateUserDto.expirationCode = Date.now() + 2 * 60 * 1000;
      CreateUserDto.verifyCode = this.generateSecureCode(8);
      CreateUserDto.verified = false;
      
      const email = await this.cryptoService.decrypt(CreateUserDto.email);
      await this.mailService.sendUserConfirmation(
        email,
        CreateUserDto.verifyCode,
      );

      return await this.usersService.addUser(CreateUserDto);
    }
    catch (error) {
      throw new Error('cannot add user');
    }
  }

  async verifyCode(code: string) {
    return await this.usersService.getUserByCode(code);
  }

  async sendNewCode(user: User) {
    const verifyCode = this.generateSecureCode(8);

    const email = await this.cryptoService.decrypt(user.email);

    await this.mailService.sendUserConfirmation(email, verifyCode);
    await this.usersService.updateUser(user.id, {
      expirationCode: Date.now() + 2 * 60 * 1000,
      verifyCode,
    });
  }

  async loginWithGoogle(CreateUserDto: CreateUserDto) {
    if (!CreateUserDto) throw new Error('Unauthenticated');

    const encryptedValues = await Promise.all([
      this.cryptoService.encrypt(CreateUserDto.email),
      this.cryptoService.encrypt(CreateUserDto.first_name),
      this.cryptoService.encrypt(CreateUserDto.last_name),
      this.cryptoService.encrypt(CreateUserDto.image),
    ]);

    CreateUserDto.email = encryptedValues[0];
    CreateUserDto.first_name = encryptedValues[1];
    CreateUserDto.last_name = encryptedValues[2];
    CreateUserDto.image = encryptedValues[3];

    let user = await this.usersService.getUserByEmail(
      CreateUserDto.email,
      'google',
    );

    if (!user) user = await this.usersService.addUser(CreateUserDto);
    else await this.usersService.updateUser(user.id, CreateUserDto);

    return user;
  }

  async updateUser(id: number, properties: Partial<User>) {
    await this.usersService.updateUser(id, properties);
  }

  async updateAvatarLogin(userId: number, login: string, avatar: Avatar) {
    const user = await this.usersService.getUserAvatar(userId);
    if (!user) throw new Error('No user found');

    if (user.login && user.login !== "" && user.avatar && user.avatar.backgroundColor)
      return user;

    user.login = login;
    await this.usersService.updateUser(user.id, {
      login: login,
    });
    await this.usersService.updateUserAvatar(user, avatar);

    return user;
  }

  async createAvatar(avatar: AvatarDto) {
    if (avatar.decrypt)
      avatar.image = await this.cryptoService.encrypt(avatar.image);
    return await this.avatarService.createAvatar(avatar);
  }

  async getUserById(id: number) {
    return await this.usersService.getUserById(id);
  }

  async updateRefreshToken(
    user: User,
    refreshToken: string,
    nbOfRefreshes: number,
  ) {
    const hashedRefreshToken = await argon2.hash(refreshToken);

    const token = new Token();
    token.user = user;
    token.value = hashedRefreshToken;
    token.NbOfRefreshes = nbOfRefreshes;

    await this.usersService.saveToken(token);
  }

  async findMatchingToken(
    refreshToken: string,
    tokens: Token[],
  ): Promise<Token | undefined> {
    if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
      console.log("begin search match");
    for (const token of tokens) {
      const isMatch = await argon2.verify(token.value, refreshToken);
      if (isMatch) {
        return token;
      }
    }
    if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
      console.log("end search match", refreshToken);
    return undefined;
  }

  async refreshToken(userId: number, refreshToken: string) {
    try {
      const user = await this.usersService.getUserTokens(userId);

      if (!user) throw new Error('no user found');

      const payload = verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET,
      ) as any;

      if (!payload) {
        throw new Error('cannot verify token');
      }

      const isMatch = await this.findMatchingToken(refreshToken, user.tokens);
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log("ismatch = ", isMatch.NbOfRefreshes);
        
      if (!isMatch) {
        await this.usersService.deleteAllUserTokens(user);
        if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
          console.log('NOT VALID=', refreshToken);
        throw new Error('token not valid!');
      }

      if (isMatch.NbOfRefreshes >= 120) {
        await this.usersService.deleteAllUserTokens(user);
        throw new Error('Too long, needs to reconnect');
      }

      setTimeout(async () => {
        await this.usersService.deleteToken(isMatch);
        if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
          console.log('JUST DELETED=', refreshToken);
      }, 60000);

      return await this.login(user, isMatch.NbOfRefreshes + 1, false);
    } catch (error) {
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async sendPassword(userId: number) {
    try {
      const user = await this.usersService.getUserById(userId);

      if (!user) throw new Error('no user found');

      const newPassword = this.generatePassword(20);

      const salt = await bcrypt.genSalt();
      const passwordHashed = await bcrypt.hash(newPassword, salt);

      await this.usersService.updateUser(user.id, {
        passwordHashed: passwordHashed,
      });

      const email = await this.cryptoService.decrypt(user.email);

      await this.mailService.sendUserNewPassword(email, newPassword);

      return {
        success: true,
      };
    } catch (error) {
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(error);
      throw new BadRequestException();
    }
  }

  async forgotPassword(email: string) {
    try {
      if (!email) throw new Error('no email');

      const emailDecrypted = await this.cryptoService.decrypt(email);

      const user = await this.usersService.getUserByEmail(email, 'email');

      if (!user) throw new Error('no user found');

      const newPassword = this.generatePassword(20);

      const salt = await bcrypt.genSalt();
      const passwordHashed = await bcrypt.hash(newPassword, salt);

      await this.usersService.updateUser(user.id, {
        passwordHashed: passwordHashed,
      });

      await this.mailService.sendUserNewPassword(emailDecrypted, newPassword);

      return {
        success: true,
      };
    } catch (error) {
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(error);
      throw new BadRequestException();
    }
  }

  private generatePassword(length = 20) {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const digitChars = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars =
      uppercaseChars + lowercaseChars + digitChars + specialChars;

    const passwordChars = [];

    // Ensure at least one uppercase letter, one digit, and one special character
    passwordChars.push(this.getRandomChar(uppercaseChars));
    passwordChars.push(this.getRandomChar(digitChars));
    passwordChars.push(this.getRandomChar(specialChars));

    // Generate remaining characters for the password
    for (let i = passwordChars.length; i < length; i++) {
      passwordChars.push(this.getRandomChar(allChars));
    }

    // Shuffle the password characters
    passwordChars.sort(() => Math.random() - 0.5);

    return passwordChars.join('');
  }

  private getRandomChar(characters: string) {
    return characters.charAt(crypto.randomInt(0, characters.length));
  }
}
