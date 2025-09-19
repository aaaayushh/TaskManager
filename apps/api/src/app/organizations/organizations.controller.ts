import { Controller, Post, Body, Get, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../../entities/user.entity';

@Controller('organizations')
//@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Post('create')
  //@Roles(Role.OWNER, Role.ADMIN)
  async createOrganization(@Request() req, @Body() body: { name: string; parentId?: number }) {
    const performedBy = req.user;
    return this.orgService.createOrganization(body.name, body.parentId, performedBy);
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  async getAll(@Request() req) {
    const performedBy = req.user;
    return this.orgService.getAllOrganizations(performedBy);
  }

  @Get(':id')
  async getById(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const performedBy = req.user;
    return this.orgService.getOrganizationById(id, performedBy);
  }
}
