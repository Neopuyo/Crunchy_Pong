import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class repDto {
  @IsBoolean()
  @IsNotEmpty()
  success: boolean;

  @IsString()
  @IsOptional()
  message: string;
}
