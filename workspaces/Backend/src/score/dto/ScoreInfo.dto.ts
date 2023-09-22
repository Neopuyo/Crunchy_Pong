import {
  IsNumber,
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoundInfoDTO } from '@/score/dto/RoundInfo.dto';

export class ScoreInfoDTO {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  leftRound: 0 | 1 | 2 | 3 | 4 | 5;

  @IsNumber()
  @IsNotEmpty()
  rightRound: 0 | 1 | 2 | 3 | 4 | 5;

  @IsArray()
  @ValidateNested()
  @Type(() => RoundInfoDTO)
  round: RoundInfoDTO[];

  @IsString()
  rageQuit: 'Left' | 'Right' | '';

  @IsString()
  disconnect: 'Left' | 'Right' | '';

  @IsNumber()
  @IsNotEmpty()
  leftPause: 0 | 1 | 2 | 3;

  @IsNumber()
  @IsNotEmpty()
  rightPause: 0 | 1 | 2 | 3;
}
