import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger('Audit');
  private readonly logFilePath: string;

  constructor() {
    // Logs folder in project root
    const logsDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    this.logFilePath = path.join(logsDir, 'audit.log');
  }

  logAction(userId: number, action: string, details?: any) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] [User:${userId}] Action: ${action} ${details ? JSON.stringify(details) : ''}`;

    // Log to console
    this.logger.log(message);

    // Append to file
    fs.appendFileSync(this.logFilePath, message + '\n', { encoding: 'utf8' });
  }

  // Optional: read all audit logs
  getLogs(): string[] {
    if (!fs.existsSync(this.logFilePath)) return [];
    const data = fs.readFileSync(this.logFilePath, { encoding: 'utf8' });
    return data.split('\n').filter(line => line.trim() !== '');
  }
}
