import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../entities/organization.entity';
import { User } from '../../entities/user.entity';
import { AuditLoggerService } from '../audit/audit.service';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    private readonly auditLogger: AuditLoggerService,
  ) {}

  // Create organization
  async createOrganization(name: string, parentId?: number, performedBy?: User) {
    const parentOrg = parentId ? await this.orgRepo.findOne({ where: { id: parentId } }) : null;

    const org = this.orgRepo.create({ name, parent: parentOrg });
    const savedOrg = await this.orgRepo.save(org);

    if (performedBy) {
      this.auditLogger.logAction(performedBy.id, 'CREATE_ORG', { orgId: savedOrg.id, name });
    }

    return savedOrg;
  }

  // Get all organizations
  async getAllOrganizations(performedBy?: User) {
    const orgs = await this.orgRepo.find({ relations: ['parent'] });

    if (performedBy) {
      this.auditLogger.logAction(performedBy.id, 'VIEW_ALL_ORGS', { count: orgs.length });
    }

    return orgs;
  }

  // Get organization by ID
  async getOrganizationById(id: number, performedBy?: User) {
    const org = await this.orgRepo.findOne({ where: { id }, relations: ['parent'] });

    if (performedBy && org) {
      this.auditLogger.logAction(performedBy.id, 'VIEW_ORG', { orgId: org.id, name: org.name });
    }

    return org;
  }
}
