/* eslint-disable prettier/prettier */
import { AfterLoad, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { NotifMessages } from "./NotifMessages.entity";

@Entity()
export class Notif {

	@PrimaryGeneratedColumn()
	id: number;

	@Column("int", { array: true, default: {} })
	redPongies: number[];

	@Column({ default: false })
	redAchievements: boolean;

	@OneToMany(() => NotifMessages, notifMessages => notifMessages.notif, {
		eager: true,
	})
	notifMessages: NotifMessages[];

	@AfterLoad()
	async nullChecks() {
		if (!this.notifMessages) {
			this.notifMessages = [];
		}
	}
}
