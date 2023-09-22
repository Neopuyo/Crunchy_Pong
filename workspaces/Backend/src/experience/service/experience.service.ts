import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExperienceData } from '@/utils/typeorm/ExperienceData.entity';
import { CreateExperienceDataDTO } from '../dto/CreateExperienceData.dto';
import { NextLevel } from '@transcendence/shared/types/Stats.types';

@Injectable()
export class ExperienceService implements OnModuleInit {
  // ----------------------------------  CONSTRUCTOR  --------------------------------- //

  constructor(
    @InjectRepository(ExperienceData)
    private readonly experienceDataRepository: Repository<ExperienceData>,
  ) {}

  onModuleInit() {
    this.createExperienceData();
  }

  // --------------------------------  PUBLIC METHODS  -------------------------------- //

  public async getExperienceData(): Promise<ExperienceData[]> {
    try {
      let experienceDatas = await this.experienceDataRepository.find();
      if (!experienceDatas || experienceDatas.length === 0) {
        await this.createExperienceData();
        experienceDatas = await this.experienceDataRepository.find();
      }
      experienceDatas.sort((a, b) => a.level - b.level);
      return experienceDatas;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async getNextLevelXp(level: number): Promise<NextLevel> {
    try {
      const experienceData = await this.experienceDataRepository.findOne({
        where: { level },
      });
      if (!experienceData) {
        throw new Error('Level not found');
      }
      const nextLevelXP: NextLevel = {
        nextLevelXP: experienceData.levelXp,
        cumulativeXpToNext: experienceData.cumulativeXP,
      };
      return nextLevelXP;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // --------------------------------  PRIVATE METHODS  ------------------------------- //

  private async createExperienceData(): Promise<void> {
    try {
      const experienceDatas = await this.experienceDataRepository.find();
      if (experienceDatas && experienceDatas.length > 0) {
        return;
      }
      const levels: CreateExperienceDataDTO[] = [];
      for (let i: number = 0; i <= 100; i++) {
        const level: CreateExperienceDataDTO = {
          level: i + 1,
          levelXp: (i + 1) * 100,
          cumulativeXP: i === 0 ? 0 : levels[i - 1].cumulativeXP,
        };
        level.cumulativeXP += level.levelXp;
        levels.push(level);
      }

      for (const level of levels) {
        await this.experienceDataRepository.save(level);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
