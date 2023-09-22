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
import { Public } from 'src/utils/decorators/public.decorator';
import { StoryService } from '../service/story.service';
import { UpdateStoryDTO } from '../dto/UpdateStory.dto';

@Controller('story')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  // 00 - api/story/status Pour test d'api
  @Public()
  @Get('status')
  Status() {
    return 'Working !';
  }

  // 01 - api/story/get/:userId
  @Get('get/:userId')
  async GetStoryByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.storyService.getUserStories(userId);
  }

  // 02 - api/story/update/:userId
  @Put('update/:userId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async UpdateStats(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() update: UpdateStoryDTO,
  ) {
    return this.storyService.updateStory(userId, update);
  }
}
