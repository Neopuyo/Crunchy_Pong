import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateExperienceDataDTO {
  @IsNumber()
  @IsNotEmpty()
  level: number;

  @IsNumber()
  @IsNotEmpty()
  levelXp: number;

  @IsNumber()
  @IsNotEmpty()
  cumulativeXP: number;
}
