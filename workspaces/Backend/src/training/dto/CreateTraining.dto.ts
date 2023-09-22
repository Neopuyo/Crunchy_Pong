import {
  IsNumber,
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateTrainingDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: 'Classic' | 'Best3' | 'Best5' | 'Custom' | 'Story';

  @IsNumber()
  @IsOptional()
  storyLevel?: number;

  @IsNumber()
  @IsNotEmpty()
  player: number;

  @IsString()
  @IsNotEmpty()
  side: 'Left' | 'Right';

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
