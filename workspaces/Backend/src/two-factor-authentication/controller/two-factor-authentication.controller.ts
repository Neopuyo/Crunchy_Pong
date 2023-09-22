/* eslint-disable prettier/prettier */
import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import { TwoFactorAuthenticationService } from '../service/two-factor-authentication.service';
import { UsersService } from '@/users/service/users.service';
import { AuthService } from '@/auth/services/auth.service';
import { TwoFactorAuthenticationCodeDto } from '../dto/TwoFactorAuthenticationCode.dto';
import { VerifYCodeDto } from '../dto/VerifYCode.dto';
import { BackupCodeDto } from '../dto/BackupCode.dto';
import { AchievementService } from '@/achievement/service/achievement.service';

@Controller('2fa')
export class TwoFactorAuthenticationController {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly achievementService: AchievementService,
  ) {}

  @Get('generate')
  async register(@Req() req) {
    try {
      const user = await this.usersService.getUserById(req.user.id);

      if (!user) throw new Error('no user found');

      return await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
        user,
      );
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  @Get('sendCode')
  async sendCode(@Req() req) {
    try {
      const user = await this.usersService.getUserById(req.user.id);

      if (!user) throw new Error('no user found');

      this.twoFactorAuthenticationService.sendMail(user);
    } catch (error) {
		  if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(error.message);
      throw new BadGatewayException();
    }
  }

  @Post('verifyCode')
  async verifyCode(@Body() { code }: VerifYCodeDto, @Req() req) {
    try {
      const user = await this.usersService.getUserById(req.user.id);

      if (!user) throw new Error('no user found');

      if (user.verifyCode !== code) {
        this.twoFactorAuthenticationService.sendMail(user);
        return {
          success: false,
          error: 'wrong code',
        };
      }

      if (user.expirationCode < Date.now()) {
        this.twoFactorAuthenticationService.sendMail(user);
        return {
          success: false,
          error: 'time out',
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(error.message);
      throw new BadGatewayException();
    }
  }

  @Post('activate')
  async activate(
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
    @Req() req,
  ) {
    try {
      const user = await this.usersService.getUserBackupCodes(req.user.id);

      if (!user) throw new Error('no user found');

      const isCodeValid =
        await this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
          twoFactorAuthenticationCode,
          user,
        );

      if (!isCodeValid)
        return {
          success: false,
          error: 'wrong code',
        };

      this.twoFactorAuthenticationService.updateBackupCodes(user);

      this.usersService.updateUser(user.id, {
        isTwoFactorAuthenticationEnabled: true,
      });

      // Achievement completed
      await this.achievementService.achievementCompleted(user.id, {
        code: 'DOUBLE_AUTH',
      });

      return {
        success: true,
      };
    } catch (error) {
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(error.message);
      throw new BadGatewayException();
    }
  }

  @Post('deactivate')
  async deactivate(
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
    @Req() req,
  ) {
    try {
      const user = await this.usersService.getUserById(req.user.id);

      if (!user) throw new Error('no user found');

      const isCodeValid =
        await this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
          twoFactorAuthenticationCode,
          user,
        );

      if (!isCodeValid)
        return {
          success: false,
          error: 'wrong code',
        };

      this.usersService.updateUser(user.id, {
        isTwoFactorAuthenticationEnabled: false,
      });

      return {
        success: true,
      };
    } catch (error) {
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(error.message);
      throw new BadGatewayException();
    }
  }

  @Post('authenticate')
  @HttpCode(200)
  async authenticate(
    @Req() req,
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
  ) {
    try {
      const user = await this.usersService.getUserById(req.user.id);

      if (!user) throw new Error('no user found');

      const isCodeValid =
        await this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
          twoFactorAuthenticationCode,
          user,
        );

      if (!isCodeValid)
        return {
          success: false,
          error: 'wrong code',
        };

      const { access_token, refresh_token } = await this.authService.login(
        user,
        0,
        false,
      );

      return {
        success: true,
        access_token,
        refresh_token,
      };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @Get('backupCodes')
  async backupCodes(@Req() req) {
    return this.twoFactorAuthenticationService.getBackupCodes(req.user.id);
  }

  @Post('verifyAuthCode')
  async verifyAuthCode(
    @Req() req,
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
  ) {
    try {
      const user = await this.usersService.getUserById(req.user.id);

      if (!user) throw new Error('no user found');

      const isCodeValid =
        await this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
          twoFactorAuthenticationCode,
          user,
        );

      if (!isCodeValid)
        return {
          success: false,
          error: 'wrong code',
        };

      return {
        success: true,
      };
    } catch (error) {
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(error.message);
      throw new BadGatewayException();
    }
  }

  @Post('getAccountBack')
  async getAccountBack(@Req() req, @Body() { backupCode }: BackupCodeDto) {
    try {
      const user = await this.usersService.getUserBackupCodes(req.user.id);

      if (!user) throw new Error('no user found');

      const isCodeValid =
        await this.twoFactorAuthenticationService.isBackupCodeValid(
          backupCode,
          user,
        );

      if (!isCodeValid)
        return {
          success: false,
          error: 'no code',
        };

      this.usersService.updateUser(user.id, {
        isTwoFactorAuthenticationEnabled: false,
      });

      const { access_token, refresh_token } = await this.authService.login(
        user,
        0,
        false,
      );

      return {
        success: true,
        access_token,
        refresh_token,
      };
    } catch (error) {
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(error.message);
      throw new BadGatewayException();
    }
  }
}
