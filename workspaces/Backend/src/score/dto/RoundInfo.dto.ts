import { IsNumber, IsNotEmpty } from 'class-validator';

export class RoundInfoDTO {
  @IsNumber()
  @IsNotEmpty()
  left: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @IsNumber()
  @IsNotEmpty()
  right: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
}
