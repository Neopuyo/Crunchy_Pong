/* eslint-disable prettier/prettier */
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User.entity";

@Entity("user_pongie_relation")
export class UserPongieRelation {

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
	pongieId: number;
	
	@ManyToOne(() => User, (user) => user.userPongieRelations)
    user: User;
	
	@ManyToOne(() => User, (pongie) => pongie.pongieUserRelations)
    pongie: User;

	@Column({ default: false})
	isFriend: boolean;

	@Column({ default: false})
	isInvited: boolean;

	@Column({ default: false})
	hasInvited: boolean;

	@Column({ default: false})
	isBlacklisted: boolean;

	@Column({ default: false})
	hasBlacklisted: boolean;
}
