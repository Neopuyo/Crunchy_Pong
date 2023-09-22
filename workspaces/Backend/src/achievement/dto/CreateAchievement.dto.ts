import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateAchievementDTO {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
