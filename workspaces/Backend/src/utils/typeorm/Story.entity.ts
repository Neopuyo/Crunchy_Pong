import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Story {
  @PrimaryGeneratedColumn()
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
  userId: number;

  @Column({ default: false })
  levelCompleted1: boolean;

  @Column({ default: 0 })
  levelAttempted1: number;

  @Column({ default: false })
  levelCompleted2: boolean;

  @Column({ default: 0 })
  levelAttempted2: number;

  @Column({ default: false })
  levelCompleted3: boolean;

  @Column({ default: 0 })
  levelAttempted3: number;

  @Column({ default: false })
  levelCompleted4: boolean;

  @Column({ default: 0 })
  levelAttempted4: number;

  @Column({ default: false })
  levelCompleted5: boolean;

  @Column({ default: 0 })
  levelAttempted5: number;

  @Column({ default: false })
  levelCompleted6: boolean;

  @Column({ default: 0 })
  levelAttempted6: number;

  @Column({ default: false })
  levelCompleted7: boolean;

  @Column({ default: 0 })
  levelAttempted7: number;

  @Column({ default: false })
  levelCompleted8: boolean;

  @Column({ default: 0 })
  levelAttempted8: number;

  @Column({ default: false })
  levelCompleted9: boolean;

  @Column({ default: 0 })
  levelAttempted9: number;

  @Column({ default: false })
  levelCompleted10: boolean;

  @Column({ default: 0 })
  levelAttempted10: number;
}
