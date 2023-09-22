/* eslint-disable prettier/prettier */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Notif } from "./Notif.entity";

@Entity()
export class NotifMessages {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	channelId: number;

	@Column()
	nbMessages: number;

	@ManyToOne(() => Notif, notif => notif.notifMessages)
	notif: Notif;
}
