/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Score } from './Score.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  type: 'Classic' | 'Best3' | 'Best5' | 'Custom' | 'Story';

  @Column()
  mode: 'League' | 'Party';

  @Column()
  host: number;

  @Column({ default: -1 })
  opponent: number;

  @Column({ default: -1 })
  invite: number;

  @Column({ default: false })
  channel: boolean;

  @Column()
  hostSide: 'Left' | 'Right';

  @OneToOne(() => Score)
  @JoinColumn()
  score: Score;

  @Column({ default: 'Not Started' })
  status: 'Not Started' | 'Stopped' | 'Playing' | 'Finished' | 'Deleted';

  @Column({ default: 'Not Finished' })
  result: 'Not Finished' | 'Draw' | 'Draw' | 'Host' | 'Opponent' | 'Deleted';

  @Column({ default: 0 })
  actualRound: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

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
