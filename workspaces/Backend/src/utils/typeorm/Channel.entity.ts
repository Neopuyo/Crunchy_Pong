/* eslint-disable prettier/prettier */
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User.entity';
import { Avatar } from './Avatar.entity';
import { UserChannelRelation } from './UserChannelRelation';
import { Message } from './Message.entity';

@Entity()
export class Channel {

	@PrimaryGeneratedColumn()
	id: number;

	@CreateDateColumn({
		type: 'timestamptz',
	  })
	createdAt: Date;

	@UpdateDateColumn({
		type: 'timestamptz',
	  })
	updatedAt: Date;

	@Column()
	name: string;

	@ManyToMany(() => User, (user) => user.channels)
	users: User[];

	@OneToMany(() => UserChannelRelation, userChannelRelation => userChannelRelation.user)
	userChannelRelations: UserChannelRelation[];

	@OneToOne(() => Avatar)
	@JoinColumn()
	avatar: Avatar;

	@Column({ default: 'public', nullable: false })
	type: 'public' | 'protected' | 'private' | 'privateMsg';

  @Column({ default: "", nullable: false })
  password: string;

	// Relation one<Channel> [to] Many<Message>
	@OneToMany(() => Message, (message) => message.channel)
	messages: Message[];

	// In order to get the last message without get all messages
	@OneToOne(() => Message)
	@JoinColumn()
	lastMessage: Message;
}
