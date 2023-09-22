import { Module } from '@nestjs/common';
import { ScoreController } from './controller/score.controller';
import { ScoreService } from './service/score.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Score } from 'src/utils/typeorm/Score.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Score])],
  controllers: [ScoreController],
  providers: [ScoreService],
  exports: [ScoreService],
})
export class ScoreModule {}
