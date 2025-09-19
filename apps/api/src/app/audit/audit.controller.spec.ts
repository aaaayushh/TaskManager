import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogController } from './audit.controller';
import { AuditLoggerService } from './audit.service';
import { Role } from '../../entities/user.entity';

describe('AuditLogController', () => {
  let controller: AuditLogController;
  let auditLoggerService: Partial<Record<keyof AuditLoggerService, jest.Mock>>;

  beforeEach(async () => {
    auditLoggerService = {
      getLogs: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogController],
      providers: [{ provide: AuditLoggerService, useValue: auditLoggerService }],
    }).compile();

    controller = module.get<AuditLogController>(AuditLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAuditLogs', () => {
    it('should return audit logs', async () => {
      const mockLogs = [
        { id: 1, action: 'CREATE_TASK', userId: 2, timestamp: new Date() },
        { id: 2, action: 'DELETE_USER', userId: 1, timestamp: new Date() },
      ];

      auditLoggerService.getLogs.mockResolvedValue(mockLogs);

      const result = await controller.getAuditLogs();

      expect(auditLoggerService.getLogs).toHaveBeenCalled();
      expect(result).toEqual(mockLogs);
    });
  });
});
