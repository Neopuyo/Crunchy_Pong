import { Module } from '@nestjs/common';
import { ExperienceService } from './service/experience.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExperienceData } from '@/utils/typeorm/ExperienceData.entity';
import { ExperienceController } from './controller/experience.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExperienceData])],
  providers: [ExperienceService],
  controllers: [ExperienceController],
  exports: [ExperienceService],
})
export class ExperienceModule {}
