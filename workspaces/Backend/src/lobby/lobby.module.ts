import { Module } from '@nestjs/common';

import { LobbyService } from './service/lobby.service';
import { LobbyController } from './controller/lobby.controller';
import { CryptoService } from '@/utils/crypto/crypto';
import { StatsModule } from '@/stats/stats.module';
import { GameModule } from '@/game/game.module';
import { UsersModule } from '@/users/users.module';
import { ChannelModule } from '@/channels/channel.module';
import { AvatarModule } from '@/avatar/avatar.module';
@Module({
  imports: [AvatarModule, ChannelModule, GameModule, StatsModule, UsersModule],
  controllers: [LobbyController],
  providers: [CryptoService, LobbyService],
  exports: [LobbyService],
})
export class LobbyModule {}
