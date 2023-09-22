import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Training } from 'src/utils/typeorm/Training.entity';
import { Score } from '@/utils/typeorm/Score.entity';

import { ScoreService } from '@/score/service/score.service';
import { CryptoService } from '@/utils/crypto/crypto';
import { UsersService } from '@/users/service/users.service';
import { AvatarService } from '@/avatar/service/avatar.service';
import { StatsService } from '@/stats/service/stats.service';

import { CreateTrainingDTO } from '../dto/CreateTraining.dto';
import { CreateScoreDTO } from '@/score/dto/CreateScore.dto';
import { UpdateTrainingDTO } from '../dto/UpdateTraining.dto';

import { AI_ID } from '@transcendence/shared/constants/Game.constants';
import { GameData, Player } from '@transcendence/shared/types/Game.types';
import { initPong } from '@transcendence/shared/game/initPong';
import { colorHexToRgb } from '@transcendence/shared/game/pongUtils';
import { StatsUpdate } from '@transcendence/shared/types/Stats.types';
import { ScoreInfo } from '@transcendence/shared/types/Score.types';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(Training)
    private readonly trainingRepository: Repository<Training>,

    private readonly scoreService: ScoreService,
    private readonly cryptoService: CryptoService,
    private readonly usersService: UsersService,
    private readonly avatarService: AvatarService,
    private readonly statsService: StatsService,
  ) {}

  public async createTraining(
    training: CreateTrainingDTO,
  ): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const trainingExist = await this.isInTraining(training.player);
      if (trainingExist.success) {
        await this.quitTraining(trainingExist.data, training.player);
      }
      const newTraining = await this.trainingRepository.save(training);
      const newScore: CreateScoreDTO = {
        gameId: newTraining.id,
        mode: 'Training',
        leftPlayerId: newTraining.side == 'Left' ? newTraining.player : AI_ID,
        rightPlayerId: newTraining.side == 'Right' ? newTraining.player : AI_ID,
      };
      const score = await this.scoreService.createScore(newScore);
      await this.updateTrainingScore(newTraining, score);
      ret.success = true;
      ret.message = 'Training created';
      ret.data = newTraining.id;
      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  public async getTrainingById(
    trainingId: string,
    userId: number,
  ): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const training = await this.trainingRepository.findOne({
        where: { id: trainingId },
      });
      if (!training) {
        ret.message = 'Training not found';
        return ret;
      }
      if (training.player != userId) {
        ret.message = 'You are not the owner of this training';
        return ret;
      }
      const score = await this.scoreService.getScoreByGameId(training.id);
      const trainingData: GameData = initPong({
        id: training.id,
        name: training.name,
        type: training.type,
        mode: 'Training',
        hostSide: training.side,
        actualRound: training.actualRound,
        maxPoint: training.maxPoint,
        maxRound: training.maxRound,
        difficulty: training.difficulty,
        push: training.push,
        pause: training.pause,
        background: training.background,
        ball: training.ball,
        score: score,
      });
      trainingData.playerLeft = await this.definePlayer(
        'Left',
        training.side == 'Left' ? training.player : AI_ID,
        training.type,
      );
      trainingData.playerRight = await this.definePlayer(
        'Right',
        training.side == 'Right' ? training.player : AI_ID,
        training.type,
      );
      trainingData.status = training.status;
      trainingData.storyLevel = training.storyLevel;
      ret.success = true;
      ret.message = 'Training found';
      ret.data = trainingData;
      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  public async isInTraining(userId: number): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const training = await this.trainingRepository.findOne({
        where: {
          player: userId,
          status: In(['Not Started', 'Stopped', 'Playing']),
        },
      });
      if (training) {
        ret.success = true;
        ret.message = 'You are in a training';
        ret.data = training.id;
      }
      ret.message = 'You are not in a training';
      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  public async updateTraining(
    trainingId: string,
    userId: number,
    updates: UpdateTrainingDTO,
  ): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const training = await this.trainingRepository.findOne({
        where: { id: trainingId },
      });
      if (!training) {
        ret.message = 'Training not found';
        return ret;
      }
      if (training.player != userId) {
        ret.message = 'You are not the owner of this training';
        return ret;
      }
      training.status = updates.status;
      const result =
        updates.result === 'Host'
          ? 'Win'
          : updates.result === 'Opponent'
          ? 'Lose'
          : updates.result;
      training.result = result;
      training.actualRound = updates.actualRound;
      await this.trainingRepository.save(training);
      ret.success = true;
      ret.message = 'Training updated';
      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  public async quitTraining(
    trainingId: string,
    userId: number,
  ): Promise<ReturnData> {
    const ret: ReturnData = {
      success: false,
      message: 'Catched an error',
    };
    try {
      const training = await this.trainingRepository.findOne({
        where: { id: trainingId },
      });
      if (!training) {
        ret.message = 'Training not found';
        return ret;
      }
      if (training.player != userId) {
        ret.message = 'You are not the owner of this training';
        return ret;
      }
      training.status = 'Deleted';
      const score: ScoreInfo = await this.scoreService.getScoreByGameId(
        training.id,
      );
      const update: StatsUpdate = {
        type: training.type,
        mode: 'Training',
        side: training.side === 'Left' ? 'Left' : 'Right',
        winSide: training.side === 'Left' ? 'Right' : 'Left',
        score: score,
        nbRound: training.maxRound,
        maxPoint: training.maxPoint,
      };
      await this.statsService.updateStats(training.player, update);
      await this.trainingRepository.save(training);
      ret.success = true;
      ret.message = 'Training deleted';
      return ret;
    } catch (error) {
      ret.error = error;
      return ret;
    }
  }

  // --------------------------------  PRIVATE METHODS  ------------------------------- //

  private async updateTrainingScore(training: Training, score: Score) {
    await this.trainingRepository
      .createQueryBuilder()
      .relation(Training, 'score')
      .of(training.id)
      .set(score);
  }

  private async definePlayer(
    side: 'Left' | 'Right',
    playerId: number,
    type: 'Classic' | 'Best3' | 'Best5' | 'Custom' | 'Story',
  ): Promise<Player> {
    if (playerId === AI_ID) {
      const AIPlayer: Player = {
        id: -2,
        name: `Coach ${type}`,
        //red color rgba
        color: { r: 232, g: 26, b: 26, a: 1 },
        avatar: {
          image: '',
          variant: 'circular',
          borderColor: '#e81a1a',
          backgroundColor: '#e81a1a',
          text: 'CO',
          empty: true,
          decrypt: false,
        },
        side: side === 'Left' ? 'Right' : 'Left',
        host: false,
      };
      return AIPlayer;
    } else {
      try {
        const user = await this.usersService.getUserById(playerId);
        const avatar = await this.avatarService.getAvatarById(playerId, false);
        if (avatar?.decrypt && avatar?.image.length > 0) {
          avatar.image = await this.cryptoService.decrypt(avatar.image);
          avatar.decrypt = false;
        }
        const player: Player = {
          id: playerId,
          name: user.login,
          color: colorHexToRgb(avatar.borderColor),
          avatar: avatar,
          side: side,
          host: true,
        };
        return player;
      } catch (error) {
        throw new Error(error.message);
      }
    }
  }
}
