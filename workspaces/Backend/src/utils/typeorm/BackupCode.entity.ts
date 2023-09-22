/* eslint-disable prettier/prettier */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";

@Entity()
export class BackupCode {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	code: string;

	@ManyToOne(() => User, user => user.backupCodes)
	user: User;
}
