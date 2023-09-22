import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class StoryData {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  level: number;

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

  @Column()
  maxPoint: 3 | 5 | 7 | 9;

  @Column()
  maxRound: 1 | 3 | 5 | 7 | 9;

  @Column()
  difficulty: -2 | -1 | 0 | 1 | 2;

  @Column()
  push: boolean;

  @Column()
  pause: boolean;

  @Column()
  background: string;

  @Column()
  ball: string;
}
