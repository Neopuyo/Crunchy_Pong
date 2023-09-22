import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ScoreService } from '../service/score.service';
import { UpdateScoreDTO } from '../dto/UpdateScore.dto';
import { UpdatePauseDTO } from '../dto/UpdatePause.dto';

@Controller('score')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Get('game/:gameId')
  async getScoreByGameId(@Param('gameId') gameId: string) {
    return this.scoreService.getScoreByGameId(gameId);
  }

  @Put('update/:gameId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateScore(
    @Param('gameId') gameId: string,
    @Body() updateScore: UpdateScoreDTO,
  ) {
    return this.scoreService.updateScore(gameId, updateScore);
  }

  @Put('updatePause/:gameId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updatePause(
    @Param('gameId') gameId: string,
    @Body() updatePause: UpdatePauseDTO,
  ) {
    return this.scoreService.updatePause(gameId, updatePause);
  }
}
