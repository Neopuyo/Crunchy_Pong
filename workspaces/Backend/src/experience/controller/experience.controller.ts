import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Public } from 'src/utils/decorators/public.decorator';
import { ExperienceService } from '../service/experience.service';

@Controller('experience')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  // 00 - api/experience/status Pour test d'api
  @Public()
  @Get('status')
  Status() {
    return 'Working !';
  }

  // 01 - api/nextLevelXp/:level
  @Get('nextLevelXp/:level')
  async getNextLevelXp(@Param('level', ParseIntPipe) level: number) {
    return this.experienceService.getNextLevelXp(level);
  }
}
