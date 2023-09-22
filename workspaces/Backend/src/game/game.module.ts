// import standard nest packages
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// import entities
import { Game } from 'src/utils/typeorm/Game.entity';

// import game providers
import { GameManager } from './class/GameManager';
import { Pong } from './class/Pong';

// import external services
import { GameService } from './service/game.service';
import { CryptoService } from '@/utils/crypto/crypto';
import { ColoredLogger } from './colored-logger';
import { StatusModule } from '@/statusService/status.module';
import { AvatarModule } from '@/avatar/avatar.module';
import { ScoreModule } from '@/score/score.module';
import { UsersModule } from '@/users/users.module';
import { StatsModule } from '@/stats/stats.module';
import { GameGateway } from './gateway/game.gateway';
import { ChatModule } from '@/chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game]),
    AvatarModule,
    ChatModule,
    ScoreModule,
    StatsModule,
    StatusModule,
    forwardRef(() => UsersModule),
  ],
  providers: [
    ColoredLogger,
    CryptoService,
    GameGateway,
    GameService,
    GameManager,
    Pong,
  ],
  exports: [GameService, GameManager, Pong],
})
export class GameModule {}
