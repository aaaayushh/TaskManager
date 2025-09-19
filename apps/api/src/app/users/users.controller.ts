import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../../entities/user.entity';

@Controller('users')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // @Post('register')
  // @Roles(Role.OWNER, Role.ADMIN)
  @Post('register')
async register(@Body() body: { username: string; password: string; role: Role; orgId: number }) {
  // performedBy is undefined for the first user
  return this.usersService.createUser(body.username, body.password, body.role, body.orgId);
}

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  async getAll(@Request() req) {
    const performedBy = req.user;
    return this.usersService.getAllUsers(performedBy);
  }

  @Get(':id')
  async getById(@Param('id') id: number) {
    return this.usersService.findById(id);
  }
}
