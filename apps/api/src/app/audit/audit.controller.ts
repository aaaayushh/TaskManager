import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../../entities/user.entity';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { AuditLoggerService } from './audit.service';

@Controller('audit-log')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AuditLogController {
  constructor(private readonly auditLogger: AuditLoggerService) {}

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  getAuditLogs() {
    return this.auditLogger.getLogs();
  }
}
