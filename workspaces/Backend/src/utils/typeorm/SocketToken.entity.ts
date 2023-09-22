/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SocketToken {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	value: string;

	@Column()
	userId: number;
}
