import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Score } from '@/utils/typeorm/Score.entity';
import { ScoreInfo } from '@transcendence/shared/types/Score.types';

import { CreateScoreDTO } from '@/score/dto/CreateScore.dto';
import { UpdateScoreDTO } from '@/score/dto/UpdateScore.dto';
import { UpdatePauseDTO } from '@/score/dto/UpdatePause.dto';

@Injectable()
export class ScoreService {
  constructor(
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
  ) {}
  public async createScore(newScore: CreateScoreDTO): Promise<Score> {
    try {
      const score = await this.scoreRepository.save(newScore);
      return score;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async addOpponent(gameId: string, opponentId: number): Promise<void> {
    try {
      const score = await this.scoreRepository.findOne({
        where: { gameId: gameId },
      });
      if (!score) {
        throw new Error('Score not found');
      }
      if (score.leftPlayerId === -1) {
        await this.scoreRepository.update(
          { gameId: gameId },
          {
            leftPlayerId: opponentId,
          },
        );
      } else if (score.rightPlayerId === -1) {
        await this.scoreRepository.update(
          { gameId: gameId },
          {
            rightPlayerId: opponentId,
          },
        );
      } else {
        throw new Error('Both players already defined');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async getScoreByGameId(gameId: string): Promise<ScoreInfo> {
    try {
      const score = await this.scoreRepository.findOne({
        where: { gameId: gameId },
      });
      if (!score) {
        throw new Error('Score not found');
      }
      const scoreInfo: ScoreInfo = {
        id: score.id,
        leftRound: score.leftPlayerRoundWon,
        rightRound: score.rightPlayerRoundWon,
        round: [
          {
            left: score.leftPlayerRound1,
            right: score.rightPlayerRound1,
          },
          {
            left: score.leftPlayerRound2,
            right: score.rightPlayerRound2,
          },
          {
            left: score.leftPlayerRound3,
            right: score.rightPlayerRound3,
          },
          {
            left: score.leftPlayerRound4,
            right: score.rightPlayerRound4,
          },
          {
            left: score.leftPlayerRound5,
            right: score.rightPlayerRound5,
          },
          {
            left: score.leftPlayerRound6,
            right: score.rightPlayerRound6,
          },
          {
            left: score.leftPlayerRound7,
            right: score.rightPlayerRound7,
          },
          {
            left: score.leftPlayerRound8,
            right: score.rightPlayerRound8,
          },
          {
            left: score.leftPlayerRound9,
            right: score.rightPlayerRound9,
          },
        ],
        rageQuit: '',
        disconnect: '',
        leftPause: score.leftPause,
        rightPause: score.rightPause,
      };
      return scoreInfo;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async updateScore(
    gameId: string,
    scoreInfo: UpdateScoreDTO,
  ): Promise<void> {
    try {
      const score = await this.scoreRepository.findOne({
        where: { gameId: gameId },
      });
      if (!score) {
        throw new Error('Score not found');
      }
      const actualRound = scoreInfo.actualRound + 1;
      if (actualRound <= 9) {
        await this.scoreRepository.update(
          { gameId: gameId },
          {
            leftPlayerRoundWon: scoreInfo.leftRound,
            rightPlayerRoundWon: scoreInfo.rightRound,
            [`leftPlayerRound${actualRound}`]: scoreInfo.left,
            [`rightPlayerRound${actualRound}`]: scoreInfo.right,
          },
        );
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async updatePause(
    gameId: string,
    pauseInfo: UpdatePauseDTO,
  ): Promise<void> {
    try {
      const score = await this.scoreRepository.findOne({
        where: { gameId: gameId },
      });
      if (!score) {
        throw new Error('Score not found');
      }
      await this.scoreRepository.update(
        { gameId: gameId },
        {
          leftPause: pauseInfo.left,
          rightPause: pauseInfo.right,
        },
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async updateRageQuit(
    gameId: string,
    rageQuit: 'Left' | 'Right',
  ): Promise<void> {
    try {
      const score = await this.scoreRepository.findOne({
        where: { gameId: gameId },
      });
      if (!score) {
        throw new Error('Score not found');
      }
      await this.scoreRepository.update(
        { gameId: gameId },
        {
          rageQuit: rageQuit,
        },
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
