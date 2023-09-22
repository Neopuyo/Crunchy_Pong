import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateStoryDTO {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
