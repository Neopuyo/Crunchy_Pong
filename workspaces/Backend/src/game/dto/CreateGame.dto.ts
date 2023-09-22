import {
  IsNumber,
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateGameDTO {
  @IsString()
  @IsNotEmpty()
  @Length(1, 31)
  name: string;

  @IsString()
  @IsNotEmpty()
  type: 'Classic' | 'Best3' | 'Best5' | 'Custom';

  @IsString()
  @IsNotEmpty()
  mode: 'League' | 'Party';

  @IsNumber()
  @IsNotEmpty()
  host: number;

  @IsNumber()
  @IsOptional()
  opponent: number;

  @IsNumber()
  @IsOptional()
  invite?: number;

  @IsBoolean()
  @IsOptional()
  channel?: boolean;

  @IsString()
  @IsNotEmpty()
  hostSide: 'Left' | 'Right';

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
