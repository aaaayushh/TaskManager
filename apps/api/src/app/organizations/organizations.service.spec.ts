import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { AuditLoggerService } from '../audit/audit.service';
import { Repository } from 'typeorm';
import { Organization } from '../../entities/organization.entity';
import { User } from '../../entities/user.entity';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let orgRepo: Partial<Record<keyof Repository<Organization>, jest.Mock>>;
  let auditLogger: Partial<Record<keyof AuditLoggerService, jest.Mock>>;

  beforeEach(async () => {
    orgRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    auditLogger = {
      logAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: 'OrganizationRepository', useValue: orgRepo },
        { provide: AuditLoggerService, useValue: auditLogger },
      ],
    })
      .overrideProvider('OrganizationRepository')
      .useValue(orgRepo)
      .compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrganization', () => {
    it('should create an organization and log action', async () => {
      const user: User = { id: 1, username: 'admin' } as User;
      const parentOrg = { id: 2, name: 'ParentOrg' } as Organization;
      const org = { id: 3, name: 'Org1', parent: parentOrg } as Organization;

      orgRepo.findOne.mockResolvedValue(parentOrg);
      orgRepo.create.mockReturnValue({ name: 'Org1', parent: parentOrg });
      orgRepo.save.mockResolvedValue(org);

      const result = await service.createOrganization('Org1', parentOrg.id, user);

      expect(orgRepo.create).toHaveBeenCalledWith({ name: 'Org1', parent: parentOrg });
      expect(orgRepo.save).toHaveBeenCalled();
      expect(auditLogger.logAction).toHaveBeenCalledWith(user.id, 'CREATE_ORG', { orgId: org.id, name: org.name });
      expect(result).toEqual(org);
    });

    it('should create an organization without parent and log', async () => {
      const user: User = { id: 1, username: 'admin' } as User;
      const org = { id: 3, name: 'Org1', parent: null } as Organization;

      orgRepo.findOne.mockResolvedValue(null);
      orgRepo.create.mockReturnValue({ name: 'Org1', parent: null });
      orgRepo.save.mockResolvedValue(org);

      const result = await service.createOrganization('Org1', undefined, user);

      expect(orgRepo.create).toHaveBeenCalledWith({ name: 'Org1', parent: null });
      expect(orgRepo.save).toHaveBeenCalled();
      expect(auditLogger.logAction).toHaveBeenCalledWith(user.id, 'CREATE_ORG', { orgId: org.id, name: org.name });
      expect(result).toEqual(org);
    });
  });

  describe('getAllOrganizations', () => {
    it('should return all organizations and log action', async () => {
      const user: User = { id: 1, username: 'admin' } as User;
      const orgs = [{ id: 1, name: 'Org1' }, { id: 2, name: 'Org2' }];

      orgRepo.find.mockResolvedValue(orgs as any);

      const result = await service.getAllOrganizations(user);

      expect(orgRepo.find).toHaveBeenCalledWith({ relations: ['parent'] });
      expect(auditLogger.logAction).toHaveBeenCalledWith(user.id, 'VIEW_ALL_ORGS', { count: orgs.length });
      expect(result).toEqual(orgs);
    });

    it('should return organizations without logging if no user', async () => {
      const orgs = [{ id: 1, name: 'Org1' }];

      orgRepo.find.mockResolvedValue(orgs as any);

      const result = await service.getAllOrganizations();

      expect(orgRepo.find).toHaveBeenCalled();
      expect(auditLogger.logAction).not.toHaveBeenCalled();
      expect(result).toEqual(orgs);
    });
  });

  describe('getOrganizationById', () => {
    it('should return org by id and log action', async () => {
      const user: User = { id: 1, username: 'admin' } as User;
      const org = { id: 1, name: 'Org1' } as Organization;

      orgRepo.findOne.mockResolvedValue(org);

      const result = await service.getOrganizationById(org.id, user);

      expect(orgRepo.findOne).toHaveBeenCalledWith({ where: { id: org.id }, relations: ['parent'] });
      expect(auditLogger.logAction).toHaveBeenCalledWith(user.id, 'VIEW_ORG', { orgId: org.id, name: org.name });
      expect(result).toEqual(org);
    });

    it('should return org without logging if no user', async () => {
      const org = { id: 1, name: 'Org1' } as Organization;

      orgRepo.findOne.mockResolvedValue(org);

      const result = await service.getOrganizationById(org.id);

      expect(orgRepo.findOne).toHaveBeenCalled();
      expect(auditLogger.logAction).not.toHaveBeenCalled();
      expect(result).toEqual(org);
    });
  });
});
