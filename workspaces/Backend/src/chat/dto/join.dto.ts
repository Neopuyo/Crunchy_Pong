/* eslint-disable prettier/prettier */
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class JoinDto {

	@IsNotEmpty()
	@IsNumber()
	id: number;

	@IsNotEmpty()
	@IsString()
	@Length(1, 100)
	channelName: string;
	
	@IsNotEmpty()
	@IsIn(["public", "private", "protected", "privateMsg"])
	channelType: "public" | "private" | "privateMsg" | "protected";

	@IsOptional()
	@IsBoolean()
	isCreation?: boolean;

	@IsOptional()
	@IsString()
	@Length(1, 20)
	password?: string;
}
