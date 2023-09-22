import { IsNumber, IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class CreateStoryDataDTO {
  @IsString()
  @IsNotEmpty()
  level: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  maxPoint: 3 | 5 | 7 | 9;

  @IsNumber()
  @IsNotEmpty()
  maxRound: 1 | 3 | 5 | 7 | 9;

  @IsNumber()
  @IsNotEmpty()
  difficulty: -2 | -1 | 0 | 1 | 2;

  @IsBoolean()
  @IsNotEmpty()
  push: boolean;

  @IsBoolean()
  @IsNotEmpty()
  pause: boolean;

  @IsString()
  @IsNotEmpty()
  background: string;

  @IsString()
  @IsNotEmpty()
  ball: string;
}
