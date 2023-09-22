import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ValidationSchema } from './validation.schema';
import { MailModule } from './mail/mail.module';

import { LobbyModule } from './lobby/lobby.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';

import { UsersModule } from './users/users.module';
import { AvatarModule } from './avatar/avatar.module';
import { ChatModule } from './chat/chat.module';
import { ChannelModule } from './channels/channel.module';
import { GameModule } from './game/game.module';
import { TrainingModule } from './training/training.module';
import { MessageModule } from './messages/messages.module';
import { StatsModule } from './stats/stats.module';
import { ScoreModule } from './score/score.module';
import { TwoFactorAuthenticationModule } from './two-factor-authentication/two-factor-authentication.module';
import { StoryModule } from './story/story.module';
import { StatusModule } from './statusService/status.module';
import { AchievementModule } from './achievement/achievement.module';
import { ExperienceModule } from './experience/experience.module';
import { DatabaseConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: ValidationSchema,
      load: [DatabaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),
    AchievementModule,
    AuthModule,
    AvatarModule,
    ChannelModule,
    ChatModule,
    ExperienceModule,
    GameModule,
    LobbyModule,
    MailModule,
    MatchmakingModule,
    MessageModule,
    ScoreModule,
    StatsModule,
    StatusModule,
    StoryModule,
    TrainingModule,
    TwoFactorAuthenticationModule,
    UsersModule,
  ],
})
export class AppModule {}
