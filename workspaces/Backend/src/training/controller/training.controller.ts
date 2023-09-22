import {
  Controller,
  Get,
  Put,
  Post,
  Req,
  Param,
  UsePipes,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { TrainingService } from 'src/training/service/training.service';
import { Public } from 'src/utils/decorators/public.decorator';
import { CreateTrainingDTO } from '@/training/dto/CreateTraining.dto';
import { UpdateTrainingDTO } from '../dto/UpdateTraining.dto';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  // 00 - api/training/status Pour test d'api
  @Public()
  @Get('status')
  Status() {
    return 'Working !';
  }

  // 01 - api/training/create
  @Post('create')
  @UsePipes(new ValidationPipe({ transform: true }))
  CreateTraining(@Body() training: CreateTrainingDTO) {
    return this.trainingService.createTraining(training);
  }

  // 02 - api/training/get/:id
  @Get('get/:id')
  GetTrainingData(@Param('id') id: string, @Req() req) {
    return this.trainingService.getTrainingById(id, req.user.id);
  }

  // 03 - api/training/isInTraining
  @Get('isInTraining')
  IsInTraining(@Req() req) {
    return this.trainingService.isInTraining(req.user.id);
  }

  // 04 - api/training/update/:id
  @Put('update/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  UpdateGame(
    @Param('id') id: string,
    @Req() req,
    @Body() training: UpdateTrainingDTO,
  ) {
    return this.trainingService.updateTraining(id, req.user.id, training);
  }

  // 05 - api/training/quit/:id
  @Post('quit/:id')
  QuitTraining(@Param('id') id: string, @Req() req) {
    return this.trainingService.quitTraining(id, req.user.id);
  }
}
