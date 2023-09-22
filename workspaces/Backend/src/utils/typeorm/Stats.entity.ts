import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Stats {
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

  // Global

  @Column()
  userId: number;

  @Column({ default: 0 })
  leagueXP: number;

  @Column({ default: 0 })
  playerXP: number;

  @Column({ default: 1 })
  level: number;

  @Column({ default: false })
  levelUp: boolean;

  @Column({ default: 0 })
  demoWatched: number;

  @Column({ default: 0 })
  storyLevelCompleted: number;

  // League stats

  @Column({ default: 0 })
  leagueClassicWon: number;

  @Column({ default: 0 })
  leagueClassicLost: number;

  @Column({ default: 0 })
  leagueBest3Won: number;

  @Column({ default: 0 })
  leagueBest3Lost: number;

  @Column({ default: 0 })
  leagueBest5Won: number;

  @Column({ default: 0 })
  leagueBest5Lost: number;

  @Column({ default: 0 })
  leagueRageQuitWin: number;

  @Column({ default: 0 })
  leagueRageQuitLost: number;

  @Column({ default: 0 })
  leagueDisconnectWin: number;

  @Column({ default: 0 })
  leagueDisconnectLost: number;

  @Column({ default: 0 })
  leagueRoundWon: number;

  @Column({ default: 0 })
  leagueRoundLost: number;

  @Column({ default: 0 })
  leaguePointWon: number;

  @Column({ default: 0 })
  leaguePointLost: number;

  // Party stats

  @Column({ default: 0 })
  partyClassicWon: number;

  @Column({ default: 0 })
  partyClassicLost: number;

  @Column({ default: 0 })
  partyBest3Won: number;

  @Column({ default: 0 })
  partyBest3Lost: number;

  @Column({ default: 0 })
  partyBest5Won: number;

  @Column({ default: 0 })
  partyBest5Lost: number;

  @Column({ default: 0 })
  partyCustomWon: number;

  @Column({ default: 0 })
  partyCustomLost: number;

  @Column({ default: 0 })
  partyRageQuitWin: number;

  @Column({ default: 0 })
  partyRageQuitLost: number;

  @Column({ default: 0 })
  partyDisconnectWin: number;

  @Column({ default: 0 })
  partyDisconnectLost: number;

  @Column({ default: 0 })
  partyRoundWon: number;

  @Column({ default: 0 })
  partyRoundLost: number;

  @Column({ default: 0 })
  partyPointWon: number;

  @Column({ default: 0 })
  partyPointLost: number;

  // Training stats

  @Column({ default: 0 })
  trainingClassicWon: number;

  @Column({ default: 0 })
  trainingClassicLost: number;

  @Column({ default: 0 })
  trainingBest3Won: number;

  @Column({ default: 0 })
  trainingBest3Lost: number;

  @Column({ default: 0 })
  trainingBest5Won: number;

  @Column({ default: 0 })
  trainingBest5Lost: number;

  @Column({ default: 0 })
  trainingCustomWon: number;

  @Column({ default: 0 })
  trainingCustomLost: number;

  @Column({ default: 0 })
  trainingStoryWon: number;

  @Column({ default: 0 })
  trainingStoryLost: number;

  @Column({ default: 0 })
  trainingRoundWon: number;

  @Column({ default: 0 })
  trainingRoundLost: number;

  @Column({ default: 0 })
  trainingPointWon: number;

  @Column({ default: 0 })
  trainingPointLost: number;
}
