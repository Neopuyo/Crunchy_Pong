import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateStatsDTO {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
