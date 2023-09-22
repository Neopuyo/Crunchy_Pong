import { IsNumber, IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdateStoryDTO {
  @IsNumber()
  @IsNotEmpty()
  level: number;

  @IsBoolean()
  @IsNotEmpty()
  completed: boolean;
}
