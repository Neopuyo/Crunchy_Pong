import {
  IsBoolean,
  IsHexColor,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class AvatarDto {
  @IsString()
  image: string;

  @IsString()
  @Length(0, 3)
  text: string;

  @IsNotEmpty()
  @IsString()
  variant: string;

  @IsNotEmpty()
  @IsHexColor()
  borderColor: string;

  @IsNotEmpty()
  @IsHexColor()
  backgroundColor: string;

  @IsNotEmpty()
  @IsBoolean()
  empty: boolean;

  @IsBoolean()
  @IsNotEmpty()
  decrypt: boolean;
}
