import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateScoreDTO {
  @IsNumber()
  @IsNotEmpty()
  actualRound: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @IsNumber()
  @IsNotEmpty()
  left: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @IsNumber()
  @IsNotEmpty()
  right: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @IsNumber()
  @IsNotEmpty()
  leftRound: 0 | 1 | 2 | 3 | 4 | 5;

  @IsNumber()
  @IsNotEmpty()
  rightRound: 0 | 1 | 2 | 3 | 4 | 5;
}
