/* eslint-disable prettier/prettier */
import { IsBoolean, IsNotEmpty, IsNumber, IsObject, IsString } from "class-validator";
import { Avatar } from "src/utils/typeorm/Avatar.entity";

export class channelDto {

	@IsNumber()
	@IsNotEmpty()
	id: number;

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsObject()
	@IsNotEmpty()
	avatar: Avatar;

	@IsString()
	@IsNotEmpty()
	type: 'public' | 'protected' | 'private' | 'privateMsg';

	@IsNotEmpty()
	@IsBoolean()
	joined: boolean;

}
