import {
  IsNumber,
  IsString,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScoreInfoDTO } from '@/score/dto/ScoreInfo.dto';

export class UpdateStatsDTO {
  @IsString()
  @IsNotEmpty()
  type: 'Classic' | 'Best3' | 'Best5' | 'Custom' | 'Story';

  @IsString()
  @IsNotEmpty()
  mode: 'League' | 'Party' | 'Training';

  @IsString()
  @IsNotEmpty()
  winSide: 'Left' | 'Right';

  @IsString()
  @IsNotEmpty()
  side: 'Left' | 'Right';

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ScoreInfoDTO)
  score: ScoreInfoDTO;

  @IsNotEmpty()
  @IsNumber()
  nbRound: number;

  @IsNotEmpty()
  @IsNumber()
  maxPoint: 3 | 5 | 7 | 9;
}
