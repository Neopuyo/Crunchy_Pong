/* eslint-disable prettier/prettier */
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Avatar {
	
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

	@Column({ nullable: true })
	image: string;

	@Column({ nullable: true })
	text: string;

	@Column()
	variant: string;

	@Column()
	borderColor: string;

	@Column()
	backgroundColor: string;

	@Column()
	empty: boolean;

	@Column()
	decrypt: boolean;
}
