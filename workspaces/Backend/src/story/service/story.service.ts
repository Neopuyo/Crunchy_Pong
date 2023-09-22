import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Story } from '@/utils/typeorm/Story.entity';
import { StoryData } from '@/utils/typeorm/StoryData.entity';
import { CreateStoryDTO } from '@/story/dto/CreateStory.dto';
import { UpdateStoryDTO } from '@/story/dto/UpdateStory.dto';
import { CreateStoryDataDTO } from '../dto/CreateStoryData.dto';
import {
  UserStory,
  UserTrainingData,
} from '@transcendence/shared/types/Story.types';
import { AchievementService } from '@/achievement/service/achievement.service';
import { StatsService } from '@/stats/service/stats.service';

@Injectable()
export class StoryService implements OnModuleInit {
  // ----------------------------------  CONSTRUCTOR  --------------------------------- //

  constructor(
    @InjectRepository(Story)
    private readonly storyRepository: Repository<Story>,
    @InjectRepository(StoryData)
    private readonly storyDataRepository: Repository<StoryData>,

    private readonly achievementService: AchievementService,
    private readonly statsService: StatsService,
  ) {}

  onModuleInit() {
    this.createStoryData();
  }

  // --------------------------------  PUBLIC METHODS  -------------------------------- //

  public async createStory(newStory: CreateStoryDTO): Promise<Story> {
    try {
      const story = await this.storyRepository.save(newStory);
      return story;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async updateStory(
    userId: number,
    update: UpdateStoryDTO,
  ): Promise<Story> {
    try {
      const story = await this.storyRepository.findOne({
        where: { userId: userId },
      });
      if (!story) {
        throw new Error('Story not found');
      }
      if (!story[`levelCompleted${update.level}`]) {
        if (update.completed) {
          story[`levelCompleted${update.level}`] = update.completed;
          if (
            update.level === 1 ||
            update.level === 3 ||
            update.level === 5 ||
            update.level === 7 ||
            update.level === 10
          ) {
            await this.achievementService.achievementCompleted(userId, {
              code: `STORY_${update.level}`,
            });
          }
          await this.statsService.updateStoryLevelCompleted(
            userId,
            update.level,
          );
        }
        story[`levelAttempted${update.level}`]++;
      }
      return await this.storyRepository.save(story);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async getUserStories(userId: number): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const story = await this.storyRepository.findOne({
        where: { userId: userId },
      });

      if (!story) {
        ret.message = 'Story not found';
        return ret;
      }

      const userData: UserTrainingData[] = Array.from(
        { length: 10 },
        (_, i) => ({
          levelCompleted: story[`levelCompleted${i + 1}`],
          levelAttempted: story[`levelAttempted${i + 1}`],
        }),
      );

      const storyDatas: StoryData[] = await this.storyDataRepository.find();

      if (!storyDatas) {
        ret.message = 'Story data not found';
        return ret;
      }
      storyDatas.sort((a, b) => a.level - b.level);

      const userStories: UserStory[] = userData.map((data, i) => ({
        level: storyDatas[i].level,
        levelCompleted: data.levelCompleted,
        levelAttempted: data.levelAttempted,
        name: storyDatas[i].name,
        maxPoint: storyDatas[i].maxPoint,
        maxRound: storyDatas[i].maxRound,
        difficulty: storyDatas[i].difficulty,
        push: storyDatas[i].push,
        pause: storyDatas[i].pause,
        background: storyDatas[i].background,
        ball: storyDatas[i].ball,
      }));

      ret.success = true;
      ret.message = 'Story found';
      ret.data = userStories;
      return ret;
    } catch (error) {
      ret.error = error.message;
      return ret;
    }
  }

  // --------------------------------  PRIVATE METHODS  ------------------------------- //

  private async createStoryData(): Promise<void> {
    try {
      const storyData = await this.storyDataRepository.find();
      if (storyData.length > 0) {
        return;
      }
      const levels: CreateStoryDataDTO[] = [
        {
          level: 1,
          name: 'Want Be First',
          maxPoint: 5,
          maxRound: 1,
          difficulty: -2,
          push: false,
          pause: false,
          background: 'Classic',
          ball: 'Volley1',
        },
        {
          level: 2,
          name: 'El Classico',
          maxPoint: 9,
          maxRound: 1,
          difficulty: -2,
          push: false,
          pause: false,
          background: 'Classic',
          ball: 'Classic',
        },
        {
          level: 3,
          name: 'Round Up The Pause',
          maxPoint: 3,
          maxRound: 3,
          difficulty: -1,
          push: false,
          pause: true,
          background: 'Earth',
          ball: 'Basket',
        },
        {
          level: 4,
          name: `Let's Push`,
          maxPoint: 5,
          maxRound: 3,
          difficulty: -1,
          push: true,
          pause: true,
          background: 'Island',
          ball: 'Football4',
        },
        {
          level: 5,
          name: 'Best Three',
          maxPoint: 7,
          maxRound: 3,
          difficulty: 0,
          push: true,
          pause: true,
          background: 'Winter',
          ball: 'Bowling2',
        },
        {
          level: 6,
          name: 'Best Five',
          maxPoint: 5,
          maxRound: 5,
          difficulty: 0,
          push: true,
          pause: true,
          background: 'Tennis',
          ball: 'Volley2',
        },
        {
          level: 7,
          name: 'Rising Challenge',
          maxPoint: 5,
          maxRound: 7,
          difficulty: 1,
          push: false,
          pause: true,
          background: 'Random',
          ball: 'Random',
        },
        {
          level: 8,
          name: 'Advanced Struggle',
          maxPoint: 3,
          maxRound: 9,
          difficulty: 1,
          push: true,
          pause: true,
          background: 'Football',
          ball: 'Football2',
        },
        {
          level: 9,
          name: 'Masterful Test',
          maxPoint: 9,
          maxRound: 5,
          difficulty: 2,
          push: true,
          pause: true,
          background: 'Rugby',
          ball: 'Rugby',
        },
        {
          level: 10,
          name: 'Transcendence',
          maxPoint: 9,
          maxRound: 9,
          difficulty: 2,
          push: false,
          pause: false,
          background: 'Random',
          ball: 'Random',
        },
      ];

      for (const level of levels) {
        await this.storyDataRepository.save(level);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
