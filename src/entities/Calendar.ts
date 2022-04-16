import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Calendar extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  body!: string;

  @Column('timestamptz')
  date!: Date;

  @Column('text')
  time!: '11:30' | '13:00' | '14:30' | '16:00' | '17:30';

  @Column('timestamptz')
  @CreateDateColumn()
  created_at!: Date;
}
