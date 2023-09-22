/* eslint-disable prettier/prettier */
import { MailService } from '@/mail/mail.service';
import { UsersService } from '@/users/service/users.service';
import { CryptoService } from '@/utils/crypto/crypto';
import { User } from '@/utils/typeorm/User.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { authenticator } from 'otplib';

@Injectable()
export class TwoFactorAuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly cryptoService: CryptoService,
    private readonly mailService: MailService,
  ) {}

  public async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();
    const email = await this.cryptoService.decrypt(user.email);

    const otpauthUrl = authenticator.keyuri(
      email,
      process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
      secret,
    );

    const secretCrypted = await this.cryptoService.encrypt(secret);

    await this.usersService.updateUser(user.id, {
      twoFactorAuthenticationSecret: secretCrypted,
    });

    return {
      otpauthUrl,
      secret,
    };
  }

  async sendMail(user: User) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = randomBytes(8);
    const verifyCode = Array.from(
      bytes,
      (byte) => chars[byte % chars.length],
    ).join('');

    const email = await this.cryptoService.decrypt(user.email);

    await this.mailService.sendUser2faVerification(email, verifyCode);

    await this.usersService.updateUser(user.id, {
      expirationCode: Date.now() + 5 * 60 * 1000,
      verifyCode,
    });
  }

  public async isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: User,
  ) {
    const secret = await this.cryptoService.decrypt(
      user.twoFactorAuthenticationSecret,
    );

    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret,
    });
  }

  public async isBackupCodeValid(backupCode: string, user: User) {
    for (const backupCodeUser of user.backupCodes) {
      const backupCodeDecrypted = await this.cryptoService.decrypt(
        backupCodeUser.code,
      );

      if (backupCodeDecrypted === backupCode) {
        this.usersService.deleteBackupCode(backupCodeUser);
        return true;
      }
    }
    return false;
  }

  private generateBackupCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = randomBytes(length);
    const backupCode = Array.from(
      bytes,
      (byte) => chars[byte % chars.length],
    ).join('');
    return backupCode;
  }

  public generateBackupCodes(count: number, length: number): string[] {
    const backupCodes: string[] = [];

    for (let i = 0; i < count; i++) {
      backupCodes.push(this.generateBackupCode(length));
    }

    return backupCodes;
  }

  async updateBackupCodes(user: User) {
    await this.usersService.deleteBackupCodes(user);

    const backupCodes = this.generateBackupCodes(10, 10);

    const backupCodesCrypted = await Promise.all(
      backupCodes.map((backupCode) => {
        return this.cryptoService.encrypt(backupCode);
      }),
    );

    await Promise.all(
      backupCodesCrypted.map((backupCode) => {
        this.usersService.saveBackupCode(user, backupCode);
      }),
    );
  }

  async getBackupCodes(userId: number) {
    try {
      const user = await this.usersService.getUserBackupCodes(userId);

      if (!user) throw new Error('no user found');

      if (!user.backupCodes) await this.updateBackupCodes(user);

      const backupCodes = await Promise.all(
        user.backupCodes.map((backupCode) => {
          return this.cryptoService.decrypt(backupCode.code);
        }),
      );

      return backupCodes;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
