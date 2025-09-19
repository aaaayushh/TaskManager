import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from './organization.entity';
import { Task } from './task.entity';

export enum Role {
  OWNER = 'Owner',
  ADMIN = 'Admin',
  VIEWER = 'Viewer',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'text',
    enum: Role,
    default: Role.VIEWER,
  })
  role: Role;

  @ManyToOne(() => Organization, org => org.users, { nullable: false })
  organization: Organization;

  @OneToMany(() => Task, task => task.owner)
  tasks: Task[];
}
