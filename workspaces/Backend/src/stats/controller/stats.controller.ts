import {
  Controller,
  Get,
  Put,
  Param,
  UsePipes,
  ValidationPipe,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { StatsService } from '../service/stats.service';
import { Public } from 'src/utils/decorators/public.decorator';
import { UpdateStatsDTO } from '../dto/UpdateStats.dto';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // 00 - api/stats/status Pour test d'api
  @Public()
  @Get('status')
  Status() {
    return 'Working !';
  }

  // 01 - api/stats/getShort/:userId
  @Get('getShort/:userId')
  async getShortStats(@Param('userId', ParseIntPipe) userId: number) {
    return this.statsService.getShortStats(userId);
  }

  // 02 - api/stats/getFull/:userId
  @Get('getFull/:userId')
  async getFullStats(@Param('userId', ParseIntPipe) userId: number) {
    return this.statsService.getFullStats(userId);
  }

  // 03 - api/stats/userLevel/:userId
  @Get('getUserLevel/:userId')
  async getUserLevel(@Param('userId', ParseIntPipe) userId: number) {
    return this.statsService.getUserLevel(userId);
  }

  // 04 - api/stats/getUserLevelUp/:userId
  @Get('getUserLevelUp/:userId')
  async getUserLevelUp(@Param('userId', ParseIntPipe) userId: number) {
    return this.statsService.getUserLevelUp(userId);
  }

  // 11 - api/stats/update/:userId
  @Put('update/:userId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async UpdateStats(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() update: UpdateStatsDTO,
  ) {
    return this.statsService.updateStats(userId, update);
  }

  // 12 - api/stats/updateDemoWatched/:userId
  @Put('updateDemoWatched/:userId')
  async UpdateDemoWatched(@Param('userId', ParseIntPipe) userId: number) {
    return this.statsService.updateDemoWatched(userId);
  }
}
