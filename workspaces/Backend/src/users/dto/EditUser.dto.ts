import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class EditUserDto {
  @IsOptional()
  @IsString()
  @Matches(/^(?!.*(?:'|\"|`))[!-~À-ÿ]+/)
  @Length(4, 20)
  login?: string;

  @IsString()
  @IsOptional()
  @Length(0, 35)
  motto?: string;

  @IsString()
  @IsOptional()
  @Length(0, 350)
  story?: string;

  @IsString()
  @IsOptional()
  gameKey?: 'Arrow' | 'ZQSD' | 'WASD';
}
