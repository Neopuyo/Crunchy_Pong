/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UsersController } from './controller/users.controller';
import { UsersService } from './service/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/utils/typeorm/User.entity';
import { CryptoService } from 'src/utils/crypto/crypto';
import { Channel } from 'src/utils/typeorm/Channel.entity';
import { Token } from 'src/utils/typeorm/Token.entity';
import { BackupCode } from '@/utils/typeorm/BackupCode.entity';
import { SocketToken } from '@/utils/typeorm/SocketToken.entity';
import { Notif } from '@/utils/typeorm/Notif.entity';
import { Image } from '@/utils/typeorm/Image.entity';
import { AchievementModule } from '@/achievement/achievement.module';
import { StatsModule } from '@/stats/stats.module';
import { StoryModule } from '@/story/story.module';
import { AvatarModule } from '@/avatar/avatar.module';
import { MatchmakingModule } from '@/matchmaking/matchmaking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BackupCode,
      Channel,
      Image,
      Notif,
      SocketToken,
      Token,
      User,
    ]),
    AchievementModule,
    AvatarModule,
    MatchmakingModule,
    StatsModule,
    StoryModule,
  ],
  controllers: [UsersController],
  providers: [CryptoService, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
