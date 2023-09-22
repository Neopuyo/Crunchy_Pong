import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { MatchmakingService } from './service/matchmaking.service';
import { MatchmakingController } from './controller/matchmaking.controller';
import { Matchmaking } from 'src/utils/typeorm/Matchmaking.entity';
import { GameModule } from '@/game/game.module';
import { UsersModule } from '@/users/users.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Matchmaking]),
    GameModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [MatchmakingController],
  providers: [MatchmakingService],
  exports: [MatchmakingService],
})
export class MatchmakingModule {}
