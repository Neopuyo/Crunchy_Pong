import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateScoreDTO {
  @IsUUID()
  @IsNotEmpty()
  gameId: string;

  @IsString()
  @IsNotEmpty()
  mode: 'League' | 'Party' | 'Training';

  @IsNumber()
  @IsOptional()
  leftPlayerId: number;

  @IsNumber()
  @IsOptional()
  rightPlayerId: number;
}
