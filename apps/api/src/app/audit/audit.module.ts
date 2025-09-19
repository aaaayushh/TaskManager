import { Module } from '@nestjs/common';
import { AuditLoggerService } from './audit.service';

@Module({
  providers: [AuditLoggerService],
  exports: [AuditLoggerService], // <-- important! export it
})
export class AuditModule {}
