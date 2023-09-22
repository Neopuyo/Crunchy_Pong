/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class BackupCodeDto {

  @IsNotEmpty()
  @IsString()
  @Length(10)
  backupCode: string;
}
