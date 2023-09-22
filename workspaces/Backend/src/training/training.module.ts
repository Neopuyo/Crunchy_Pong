import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingController } from './controller/training.controller';
import { TrainingService } from './service/training.service';
import { CryptoService } from '@/utils/crypto/crypto';
import { Training } from 'src/utils/typeorm/Training.entity';
import { ScoreModule } from '@/score/score.module';
import { AvatarModule } from '@/avatar/avatar.module';
import { UsersModule } from '@/users/users.module';
import { StatsModule } from '@/stats/stats.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Training]),
    AvatarModule,
    ScoreModule,
    StatsModule,
    UsersModule,
  ],
  controllers: [TrainingController],
  providers: [CryptoService, TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
