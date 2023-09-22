import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdatePauseDTO {
  @IsNumber()
  @IsNotEmpty()
  left: 0 | 1 | 2 | 3;

  @IsNumber()
  @IsNotEmpty()
  right: 0 | 1 | 2 | 3;
}
