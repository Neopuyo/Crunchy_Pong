/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifYCodeDto {

  @IsNotEmpty()
  @IsString()
  @Length(8)
  code: string;
}
