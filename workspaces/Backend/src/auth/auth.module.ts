import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MailModule } from 'src/mail/mail.module';
import { CryptoService } from 'src/utils/crypto/crypto';
import { GoogleStrategy } from './strategies/google.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthService } from './services/auth.service';
import { JwtRefreshStrategy } from './strategies/jwtRefresh.strategy';
import { UsersModule } from '@/users/users.module';
import { AvatarModule } from '@/avatar/avatar.module';
import { AchievementModule } from '@/achievement/achievement.module';

@Module({
  imports: [
    AchievementModule,
    AvatarModule,
    JwtModule,
    PassportModule,
    MailModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    CryptoService,
    GoogleStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
