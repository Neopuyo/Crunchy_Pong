import { Module, forwardRef } from '@nestjs/common';
import { AchievementService } from './service/achievement.service';
import { AchievementController } from './controller/achievement.controller';
import { Achievement } from '@/utils/typeorm/Achievement.entity';
import { AchievementData } from '@/utils/typeorm/AchievementData.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsModule } from '@/stats/stats.module';
import { UsersModule } from '@/users/users.module';
import { Notif } from '@/utils/typeorm/Notif.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Achievement, AchievementData, Notif]),
    StatsModule,
    forwardRef(() => UsersModule),
  ],
  providers: [AchievementService],
  controllers: [AchievementController],
  exports: [AchievementService],
})
export class AchievementModule {}
