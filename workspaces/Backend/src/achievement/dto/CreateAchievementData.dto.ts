import { IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateAchievementDataDTO {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @IsNotEmpty()
  xp: number;

  @IsString()
  @IsNotEmpty()
  icone: string;

  @IsNumber()
  @IsOptional()
  value?: number;
}
