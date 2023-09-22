/* eslint-disable prettier/prettier */
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User.entity";
import { Channel } from "./Channel.entity";

@Entity("user_channel_relation")
export class UserChannelRelation {

	@PrimaryGeneratedColumn()
	relationId: number;

	@CreateDateColumn({
		type: 'timestamptz',
	  })
	createdAt: Date;

	@UpdateDateColumn({
		type: 'timestamptz',
	  })
	updatedAt: Date;

	@PrimaryColumn()
	userId: number;

	@PrimaryColumn()
	channelId: number;
	
	@ManyToOne(() => User, (user) => user.userChannelRelations)
    user: User;
	
	@ManyToOne(() => Channel, (channel) => channel.userChannelRelations)
    channel: Channel;

	@Column({ default: false})
	isBoss: boolean;

	@Column({ default: false})
	isBanned: boolean;

	@Column({ default: false})
	isChanOp: boolean;

	@Column({ default: false })
	invited: boolean;

	@Column({ default: false })
	muted: boolean;

	@Column({ default: false })
  	joined: boolean;
}
