import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { Role } from '../../entities/user.entity';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;
  let orgService: Partial<Record<keyof OrganizationsService, jest.Mock>>;

  beforeEach(async () => {
    orgService = {
      createOrganization: jest.fn(),
      getAllOrganizations: jest.fn(),
      getOrganizationById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [{ provide: OrganizationsService, useValue: orgService }],
    }).compile();

    controller = module.get<OrganizationsController>(OrganizationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrganization', () => {
    it('should create a new organization', async () => {
      const req = { user: { id: 1, username: 'admin', role: Role.ADMIN } };
      const body = { name: 'Org1', parentId: 0 };
      const mockOrg = { id: 1, ...body };

      orgService.createOrganization.mockResolvedValue(mockOrg);

      const result = await controller.createOrganization(req, body);

      expect(orgService.createOrganization).toHaveBeenCalledWith(body.name, body.parentId, req.user);
      expect(result).toEqual(mockOrg);
    });
  });

  describe('getAll', () => {
    it('should return all organizations', async () => {
      const req = { user: { id: 1, username: 'admin', role: Role.ADMIN } };
      const mockOrgs = [
        { id: 1, name: 'Org1' },
        { id: 2, name: 'Org2' },
      ];

      orgService.getAllOrganizations.mockResolvedValue(mockOrgs);

      const result = await controller.getAll(req);

      expect(orgService.getAllOrganizations).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(mockOrgs);
    });
  });

  describe('getById', () => {
    it('should return organization by ID', async () => {
      const req = { user: { id: 1, username: 'admin', role: Role.ADMIN } };
      const orgId = 1;
      const mockOrg = { id: orgId, name: 'Org1' };

      orgService.getOrganizationById.mockResolvedValue(mockOrg);

      const result = await controller.getById(req, orgId);

      expect(orgService.getOrganizationById).toHaveBeenCalledWith(orgId, req.user);
      expect(result).toEqual(mockOrg);
    });
  });
});
