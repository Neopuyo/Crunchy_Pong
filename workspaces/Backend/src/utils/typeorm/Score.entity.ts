import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Score {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdtd: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt: Date;

  @Column({})
  gameId: string;

  @Column()
  mode: 'League' | 'Party' | 'Training';

  @Column({ default: -1 })
  leftPlayerId: number;

  @Column({ default: -1 })
  rightPlayerId: number;

  @Column({ default: 0 })
  leftPlayerRoundWon: 0 | 1 | 2 | 3 | 4 | 5;

  @Column({ default: 0 })
  rightPlayerRoundWon: 0 | 1 | 2 | 3 | 4 | 5;

  @Column({ default: 0 })
  leftPlayerRound1: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 0 })
  rightPlayerRound1: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 0 })
  leftPlayerRound2: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 0 })
  rightPlayerRound2: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 0 })
  leftPlayerRound3: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 0 })
  rightPlayerRound3: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 0 })
  leftPlayerRound4: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 0 })
  rightPlayerRound4: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 0 })
  leftPlayerRound5: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 0 })
  rightPlayerRound5: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 0 })
  leftPlayerRound6: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 0 })
  rightPlayerRound6: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 0 })
  leftPlayerRound7: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 0 })
  rightPlayerRound7: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 0 })
  leftPlayerRound8: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 0 })
  rightPlayerRound8: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 0 })
  leftPlayerRound9: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 0 })
  rightPlayerRound9: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  @Column({ default: 3 })
  leftPause: 0 | 1 | 2 | 3;

  @Column({ default: 3 })
  rightPause: 0 | 1 | 2 | 3;

  @Column({ default: 'None' })
  rageQuit: 'Left' | 'Right' | '';
}
