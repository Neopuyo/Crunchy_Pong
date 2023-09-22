import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator';

class NewRelationDto {
  @IsOptional()
  @IsBoolean()
  isBoss?: boolean;

  @IsOptional()
  @IsBoolean()
  isChanOp?: boolean;

  @IsOptional()
  @IsBoolean()
  isBanned?: boolean;

  @IsOptional()
  @IsBoolean()
  joined?: boolean;

  @IsOptional()
  @IsBoolean()
  invited?: boolean;

  @IsOptional()
  @IsBoolean()
  muted?: boolean;
}

export class EditChannelRelationDto {
  @IsNumber()
  @IsNotEmpty()
  channelId: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsObject()
  @IsNotEmpty()
  newRelation: NewRelationDto;
}
