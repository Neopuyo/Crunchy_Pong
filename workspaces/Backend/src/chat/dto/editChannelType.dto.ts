import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class editChannelTypeDto {
  @IsNumber()
  @IsNotEmpty()
  channelId: number;

  @IsString()
  @IsNotEmpty()
  type: 'private' | 'protected' | 'public';
}
