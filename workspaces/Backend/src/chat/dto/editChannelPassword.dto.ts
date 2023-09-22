import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class editChannelPasswordDto {
  @IsNumber()
  @IsNotEmpty()
  channelId: number;

  @IsString()
  @Length(0, 20)
  password: string;

  @IsString()
  @IsOptional()
  source?: string;
}
