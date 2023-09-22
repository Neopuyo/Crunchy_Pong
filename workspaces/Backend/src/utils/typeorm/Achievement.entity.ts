import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Achievement {
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
  userId: number;

  @Column({ default: false })
  achv1Completed: boolean;

  @Column({ default: false })
  achv1Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv1Date: Date;

  @Column({ default: false })
  achv2Completed: boolean;

  @Column({ default: false })
  achv2Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv2Date: Date;

  @Column({ default: false })
  achv3Completed: boolean;

  @Column({ default: false })
  achv3Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv3Date: Date;

  @Column({ default: false })
  achv4Completed: boolean;

  @Column({ default: false })
  achv4Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv4Date: Date;

  @Column({ default: false })
  achv5Completed: boolean;

  @Column({ default: false })
  achv5Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv5Date: Date;

  @Column({ default: false })
  achv6Completed: boolean;

  @Column({ default: false })
  achv6Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv6Date: Date;

  @Column({ default: false })
  achv7Completed: boolean;

  @Column({ default: false })
  achv7Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv7Date: Date;

  @Column({ default: false })
  achv8Completed: boolean;

  @Column({ default: false })
  achv8Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv8Date: Date;

  @Column({ default: false })
  achv9Completed: boolean;

  @Column({ default: false })
  achv9Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv9Date: Date;

  @Column({ default: false })
  achv10Completed: boolean;

  @Column({ default: false })
  achv10Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv10Date: Date;

  @Column({ default: false })
  achv11Completed: boolean;

  @Column({ default: false })
  achv11Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv11Date: Date;

  @Column({ default: false })
  achv12Completed: boolean;

  @Column({ default: false })
  achv12Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv12Date: Date;

  @Column({ default: false })
  achv13Completed: boolean;

  @Column({ default: false })
  achv13Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv13Date: Date;

  @Column({ default: false })
  achv14Completed: boolean;

  @Column({ default: false })
  achv14Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv14Date: Date;

  @Column({ default: false })
  achv15Completed: boolean;

  @Column({ default: false })
  achv15Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv15Date: Date;

  @Column({ default: false })
  achv16Completed: boolean;

  @Column({ default: false })
  achv16Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv16Date: Date;

  @Column({ default: false })
  achv17Completed: boolean;

  @Column({ default: false })
  achv17Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv17Date: Date;

  @Column({ default: false })
  achv18Completed: boolean;

  @Column({ default: false })
  achv18Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv18Date: Date;

  @Column({ default: false })
  achv19Completed: boolean;

  @Column({ default: false })
  achv19Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv19Date: Date;

  @Column({ default: false })
  achv20Completed: boolean;

  @Column({ default: false })
  achv20Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv20Date: Date;

  @Column({ default: false })
  achv21Completed: boolean;

  @Column({ default: false })
  achv21Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv21Date: Date;

  @Column({ default: false })
  achv22Completed: boolean;

  @Column({ default: false })
  achv22Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv22Date: Date;

  @Column({ default: false })
  achv23Completed: boolean;

  @Column({ default: false })
  achv23Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv23Date: Date;

  @Column({ default: false })
  achv24Completed: boolean;

  @Column({ default: false })
  achv24Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv24Date: Date;

  @Column({ default: false })
  achv25Completed: boolean;

  @Column({ default: false })
  achv25Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv25Date: Date;

  @Column({ default: false })
  achv26Completed: boolean;

  @Column({ default: false })
  achv26Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv26Date: Date;

  @Column({ default: false })
  achv27Completed: boolean;

  @Column({ default: false })
  achv27Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv27Date: Date;

  @Column({ default: false })
  achv28Completed: boolean;

  @Column({ default: false })
  achv28Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv28Date: Date;

  @Column({ default: false })
  achv29Completed: boolean;

  @Column({ default: false })
  achv29Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv29Date: Date;

  @Column({ default: false })
  achv30Completed: boolean;

  @Column({ default: false })
  achv30Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv30Date: Date;

  @Column({ default: false })
  achv31Completed: boolean;

  @Column({ default: false })
  achv31Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv31Date: Date;

  @Column({ default: false })
  achv32Completed: boolean;

  @Column({ default: false })
  achv32Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv32Date: Date;

  @Column({ default: false })
  achv33Completed: boolean;

  @Column({ default: false })
  achv33Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv33Date: Date;

  @Column({ default: false })
  achv34Completed: boolean;

  @Column({ default: false })
  achv34Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv34Date: Date;

  @Column({ default: false })
  achv35Completed: boolean;

  @Column({ default: false })
  achv35Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv35Date: Date;

  @Column({ default: false })
  achv36Completed: boolean;

  @Column({ default: false })
  achv36Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv36Date: Date;

  @Column({ default: false })
  achv37Completed: boolean;

  @Column({ default: false })
  achv37Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv37Date: Date;

  @Column({ default: false })
  achv38Completed: boolean;

  @Column({ default: false })
  achv38Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv38Date: Date;

  @Column({ default: false })
  achv39Completed: boolean;

  @Column({ default: false })
  achv39Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv39Date: Date;

  @Column({ default: false })
  achv40Completed: boolean;

  @Column({ default: false })
  achv40Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv40Date: Date;

  @Column({ default: false })
  achv41Completed: boolean;

  @Column({ default: false })
  achv41Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv41Date: Date;

  @Column({ default: false })
  achv42Completed: boolean;

  @Column({ default: false })
  achv42Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv42Date: Date;

  @Column({ default: false })
  achv43Completed: boolean;

  @Column({ default: false })
  achv43Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv43Date: Date;

  @Column({ default: false })
  achv44Completed: boolean;

  @Column({ default: false })
  achv44Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv44Date: Date;

  @Column({ default: false })
  achv45Completed: boolean;

  @Column({ default: false })
  achv45Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv45Date: Date;

  @Column({ default: false })
  achv46Completed: boolean;

  @Column({ default: false })
  achv46Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv46Date: Date;

  @Column({ default: false })
  achv47Completed: boolean;

  @Column({ default: false })
  achv47Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv47Date: Date;

  @Column({ default: false })
  achv48Completed: boolean;

  @Column({ default: false })
  achv48Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv48Date: Date;

  @Column({ default: false })
  achv49Completed: boolean;

  @Column({ default: false })
  achv49Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv49Date: Date;

  @Column({ default: false })
  achv50Completed: boolean;

  @Column({ default: false })
  achv50Collected: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  achv50Date: Date;
}
