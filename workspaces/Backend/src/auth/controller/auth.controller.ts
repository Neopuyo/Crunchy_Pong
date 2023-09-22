/* eslint-disable prettier/prettier */
import {
  Param,
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  Request,
  BadRequestException,
  Query,
  UseFilters,
  Headers,
  HttpCode,
} from '@nestjs/common';
import { Public } from 'src/utils/decorators/public.decorator';
import { CreateUserDto } from 'src/users/dto/CreateUser.dto';
import { GoogleOauthGuard } from '../guards/google-oauth.guard';
import { Response } from 'express';
import { AvatarDto } from 'src/avatar/dto/Avatar.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';
import { HttpExceptionFilter } from '@/utils/filter/http-exception.filter';
import { JwtRefreshGuard } from '../guards/jwtRefresh.guard';
import { AchievementService } from '@/achievement/service/achievement.service';
import { UsersService } from '@/users/service/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly achievementService: AchievementService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Get('42')
  async logIn42(@Query('code') code: string, @Res() res: Response) {
    try {
      if (!code) throw new Error('no code');

      const dataToken = await this.authService.getToken42(code);
      if (!dataToken) throw new Error('no 42 token');

      const user42logged = await this.authService.logUser(dataToken);
      if (!user42logged) throw new Error('no 42 user');

      // Achievement completed
      await this.achievementService.achievementCompleted(user42logged.id, {
        code: 'LOGIN_42',
      });

      const { access_token, refresh_token } = await this.authService.login(
        user42logged,
        0,
        user42logged.isTwoFactorAuthenticationEnabled,
      );

      res.cookie('crunchy-token', access_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      });

      res.cookie('refresh-token', refresh_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      });

      return res.redirect(
        `http://${process.env.HOST_IP}:3000/home/auth/connect`,
      );
    } catch (error) {
      if (
        process.env &&
        process.env.ENVIRONNEMENT &&
        process.env.ENVIRONNEMENT === 'dev'
      )
        console.log(error);
      return res.redirect(
        `http://${process.env.HOST_IP}:3000/welcome/login/wrong`,
      );
    }
  }

  @Public()
  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    try {
      const check = await this.usersService.getUserByEmail(
        createUserDto.email,
        'email',
      );
      if (check)
        return {
          message: 'ok',
          id: -1,
        };

      const user = await this.authService.addUser(createUserDto);

      if (!user) throw new BadRequestException();

      return {
        message: 'ok',
        id: user.id,
      };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @Public()
  @Get('verifyCode/:code/:id')
  async verifyCode(@Param('code') code: string, @Param('id') id: string) {
    try {
      const userCode = await this.authService.verifyCode(code);

      if (!userCode)
        return {
          success: false,
          message: 'This code does not exist. Please try again!',
        };

      if (userCode && !userCode.verified) {
        if (id !== userCode.id.toString())
          return {
            error: 'wrong user',
          };

        if (userCode.expirationCode < Date.now()) {
          await this.authService.sendNewCode(userCode);
          return {
            success: false,
            message:
              'This code has expired. A new one has been sent to your email address',
          };
        }

        await this.authService.updateUser(userCode.id, {
          verified: true,
        });

        // complete achievement
        await this.achievementService.achievementCompleted(userCode.id, {
          code: 'VERIFY_EMAIL',
        });
      }

      const { access_token, refresh_token } = await this.authService.login(
        userCode,
        0,
        userCode.isTwoFactorAuthenticationEnabled,
      );
      return {
        success: true,
        access_token,
        refresh_token,
      };
    } catch (error) {
      return {
        message: 'Something went wrong, please try again !',
      };
    }
  }

  @Public()
  @Post('sendNewCode/:id')
  async sendNewCode(@Param('id') id: number) {
    try {
      const user = await this.authService.getUserById(id);

      if (!user) throw new Error('no user found');

      await this.authService.sendNewCode(user);

      return {
        success: true,
      };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @Public()
  @UseGuards(GoogleOauthGuard)
  @UseFilters(HttpExceptionFilter)
  @Get('google')
  async googleAuth() {}

  @Public()
  @UseGuards(GoogleOauthGuard)
  @UseFilters(HttpExceptionFilter)
  @Get('google/callback')
  async googleOauthCallback(@Req() req, @Res() res: Response) {
    try {
      const user = await this.authService.loginWithGoogle(req.user);

      if (!user) throw new Error('cannot create user');

      // Achievement completed
      await this.achievementService.achievementCompleted(user.id, {
        code: 'LOGIN_GOOGLE',
      });

      const { access_token, refresh_token } = await this.authService.login(
        user,
        0,
        user.isTwoFactorAuthenticationEnabled,
      );

      res.cookie('crunchy-token', access_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      });

      res.cookie('refresh-token', refresh_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      });

      return res.redirect(
        `http://${process.env.HOST_IP}:3000/home/auth/connect`,
      );
      // return res.redirect(`http://${process.env.HOST_IP}:3000/home`);
    } catch (error) {
      if (
        process.env &&
        process.env.ENVIRONNEMENT &&
        process.env.ENVIRONNEMENT === 'dev'
      )
        console.log(error);
      return res.redirect(
        `http://${process.env.HOST_IP}:3000/welcome/login/wrong`,
      );
    }
  }

  @Post('firstLogin')
  async firstLogin(
    @Request() req,
    @Body('login') login: string,
    @Body('avatarChosen') avatar: AvatarDto,
  ) {
    try {
      if (login.length < 4) throw new Error('Login too short');

      const avatarCreated = await this.authService.createAvatar(avatar);

      const user = await this.authService.updateAvatarLogin(
        req.user.id,
        login,
        avatarCreated,
      );

      const { access_token, refresh_token } = await this.authService.login(
        user,
        0,
        false,
      );

      return {
        error: false,
        access_token,
        refresh_token,
      };
    } catch (err) {
      return {
        error: true,
        message: err.message,
      };
    }
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async loginEmail(@Request() req) {
    if (!req.user.verified)
      return {
        msg: 'not verified',
        id: req.user.id,
      };

    return await this.authService.login(
      req.user,
      0,
      req.user.isTwoFactorAuthenticationEnabled,
    );
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Request() req, @Headers('authorization') header: string) {
    const [, refreshToken] = header.split(' ');
    return await this.authService.refreshToken(req.user.id, refreshToken);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refreshToken')
  async refreshToken(@Request() req) {
    const refreshToken = req.cookies['refresh-token'];
    return await this.authService.refreshToken(req.user.id, refreshToken);
  }

  @Post('sendPassword')
  async sendPassword(@Req() req) {
    return await this.authService.sendPassword(req.user.id);
  }

  @Public()
  @Post('forgotPassword')
  async forgotPassword(@Body('email') email: string) {
    return await this.authService.forgotPassword(email);
  }

  @Public()
  @Get('healthCheck')
  @HttpCode(200)
  healthCheck() {}
}
