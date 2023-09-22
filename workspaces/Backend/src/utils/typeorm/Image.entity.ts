/* eslint-disable prettier/prettier */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User.entity';

@Entity()
export class Image {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	imageUrl: string;

	@Column()
	publicId: string;

	@ManyToOne(() => User, user => user.images)
	user: User;
}
