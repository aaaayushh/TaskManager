import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string; // Owner, Admin, Viewer
  @Column('simple-array') permissions: string[]; // task.create, task.edit, etc.
}
