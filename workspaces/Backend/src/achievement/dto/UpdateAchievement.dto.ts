import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateAchievementDTO {
  @IsNumber()
  @IsNotEmpty()
  code: string;
}
