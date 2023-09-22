/* eslint-disable prettier/prettier */
import { IsBoolean, IsNotEmpty, IsNumber, IsObject, IsString } from "class-validator";
import { Avatar } from "src/utils/typeorm/Avatar.entity";

export class pongieDto {

	@IsNumber()
	@IsNotEmpty()
	id: number;

	@IsString()
	@IsNotEmpty()
	login: string;

	@IsObject()
	@IsNotEmpty()
	avatar: Avatar;

	@IsBoolean()
	@IsNotEmpty()
	isFriend: boolean;
}
