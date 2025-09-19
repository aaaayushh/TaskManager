import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Role } from './../../entities/user.entity';
import { Organization } from '../../entities/organization.entity';
import { AuditLoggerService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    private readonly auditLogger: AuditLoggerService,
  ) {}

  async createUser(username: string, password: string, role: string, orgId: number, performedBy?: User) {
    console.log('orgId in createUser:', orgId, role);
    const allOrgs = await this.orgRepo.find();
  console.log('All organizations in DB:', allOrgs);
  const roleEnum = Object.values(Role).find(r => r.toLowerCase() === role.toLowerCase());
  if (!roleEnum) throw new Error(`Invalid role: ${role}`);
    const existing = await this.usersRepo.findOne({ where: { username } });
    if (existing) throw new Error('Username already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const orgIdNum = Number(orgId);
    const org = await this.orgRepo.findOne({ where: { id: orgIdNum } });
    console.log('Found org:', org);
    if (!org) throw new Error('Organization not found');
    console.log('Found org:', org);
    const user = this.usersRepo.create({
      username,
      password: hashedPassword,
      role:roleEnum,
      organization: org,
    });


    const savedUser = await this.usersRepo.save(user);

    // Audit log
    if (performedBy) {
      this.auditLogger.logAction(performedBy.id, 'CREATE_USER', { newUserId: savedUser.id, username });
    }

    return savedUser;
  }

  async findByUsername(username: string) {
    return this.usersRepo.findOne({
      where: { username },
      relations: ['organization'],
    });
  }

  async findById(id: number) {
    return this.usersRepo.findOne({
      where: { id },
      relations: ['organization'],
    });
  }

  async getAllUsers(performedBy?: User) {
    const users = await this.usersRepo.find({ relations: ['organization'] });

    // Audit log
    if (performedBy) {
      this.auditLogger.logAction(performedBy.id, 'VIEW_ALL_USERS', { count: users.length });
    }

    return users;
  }
}
