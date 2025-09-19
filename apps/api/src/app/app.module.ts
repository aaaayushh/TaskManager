import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './../entities/user.entity';
import { Organization } from './../entities/organization.entity';
import { Task } from './../entities/task.entity';

// import { UsersModule } from './services/users.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: join(__dirname, '..', 'db.sqlite'),
      entities: [User, Organization, Task],
      synchronize: true, // auto-create tables in dev
    }),
    UsersModule,
    OrganizationsModule,
    TasksModule,
    AuthModule,
  ],
})
export class AppModule {}
