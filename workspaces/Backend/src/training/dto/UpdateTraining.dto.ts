import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class UpdateTrainingDTO {
  @IsString()
  @IsNotEmpty()
  status: 'Not Started' | 'Stopped' | 'Playing' | 'Finished' | 'Deleted';

  @IsString()
  @IsNotEmpty()
  result: 'Not Finished' | 'Host' | 'Opponent' | 'Deleted';

  @IsNumber()
  @IsNotEmpty()
  actualRound: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
}
