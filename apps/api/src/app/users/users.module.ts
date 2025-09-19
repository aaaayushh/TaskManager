import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../../entities/user.entity';
import { Organization } from '../../entities/organization.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization]), AuditModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // needed by AuthModule
})
export class UsersModule {}
