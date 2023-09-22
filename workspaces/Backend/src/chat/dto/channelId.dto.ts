import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class channelIdDto {
  @IsNumber()
  @IsNotEmpty()
  channelId: number;

  @IsString()
  @IsOptional()
  source?: string;
}
