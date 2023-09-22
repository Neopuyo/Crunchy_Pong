/* eslint-disable prettier/prettier */
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Length } from 'class-validator';
import { User } from 'src/utils/typeorm/User.entity';

export class sendMsgDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 350)
  content: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsObject()
  sender: User;

  @IsNotEmpty()
  @IsString()
  channelName: string;

  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @IsNotEmpty()
  @IsBoolean()
  isServerNotif: boolean;

  @IsOptional()
  @IsString()
  join?: string;
}
