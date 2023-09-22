/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { Avatar } from "src/utils/typeorm/Avatar.entity";

export class ChannelDto {

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsObject()
	@IsNotEmpty()
	avatar: Avatar;

	@IsString()
	@IsNotEmpty()
	type: 'public' | 'protected' | 'private' | 'privateMsg';

  @IsString()
  @IsOptional()
  password?:string;

}
