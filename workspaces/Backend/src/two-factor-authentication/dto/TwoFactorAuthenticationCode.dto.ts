/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class TwoFactorAuthenticationCodeDto {

  @IsNotEmpty()
  @IsString()
  @Length(6)
  twoFactorAuthenticationCode: string;
}
