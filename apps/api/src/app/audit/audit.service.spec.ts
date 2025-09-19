import { AuditLoggerService } from './audit.service';
import * as fs from 'fs';
import { Logger } from '@nestjs/common';

jest.mock('fs');

describe('AuditLoggerService', () => {
  let service: AuditLoggerService;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console logger
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

    // Clear fs mocks
    (fs.existsSync as jest.Mock).mockReset();
    (fs.mkdirSync as jest.Mock).mockReset();
    (fs.appendFileSync as jest.Mock).mockReset();
    (fs.readFileSync as jest.Mock).mockReset();

    service = new AuditLoggerService();
  });

  afterAll(() => {
    loggerSpy.mockRestore();
  });

  describe('logAction', () => {
    it('should log to console and append to file', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const userId = 1;
      const action = 'CREATE_TASK';
      const details = { taskId: 5 };

      service.logAction(userId, action, details);

      expect(loggerSpy).toHaveBeenCalled();
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`User:${userId}`),
        expect.any(String),
        { encoding: 'utf8' },
      );
    });

    it('should create logs directory if it does not exist', () => {
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => path.includes('audit.log'));
      (fs.mkdirSync as jest.Mock).mockImplementation(() => {});

      new AuditLoggerService();

      expect(fs.mkdirSync).toHaveBeenCalled();
    });
  });

  describe('getLogs', () => {
    it('should return empty array if log file does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const logs = service.getLogs();
      expect(logs).toEqual([]);
    });

    it('should return lines from log file', () => {
      const fakeData = 'line1\nline2\n\nline3\n';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(fakeData);

      const logs = service.getLogs();
      expect(logs).toEqual(['line1', 'line2', 'line3']);
    });
  });
});
