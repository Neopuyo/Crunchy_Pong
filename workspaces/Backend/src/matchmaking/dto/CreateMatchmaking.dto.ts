import { IsNotEmpty, IsNumber } from 'class-validator';

export default class CreateMatchmakingDTO {
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
