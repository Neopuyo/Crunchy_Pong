/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ClearNotifDto {

	@IsString()
	@IsNotEmpty()
	which: string;

	@IsNumber()
	@IsNotEmpty()
	id: number;
}
