import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type TimeType = '11:30' | '13:00' | '14:30' | '16:00' | '17:30';

@Entity()
export class Calendar extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  body!: string;

  @Column('timestamptz')
  date!: Date;

  @Column('text')
  selected!: string;

  @Column('text')
  time!: TimeType;

  @Column('timestamptz')
  @CreateDateColumn()
  created_at!: Date;
}
