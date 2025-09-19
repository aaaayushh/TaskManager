import { Controller, Post, Body, Get, Param, Put, Delete, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { UsersService } from '../users/users.service';
import { TaskStatus } from '../../entities/task.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../../entities/user.entity';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
  ) {}

  // Create a task
@Post('create')
async createTask(
  @Request() req,
  @Body() body: { title: string; description?: string; status?: TaskStatus },
) {
  const owner = await this.usersService.findById(req.user.id);
  if (!owner) throw new Error('User not found');

  return this.tasksService.createTask(body.title, body.description, owner, body.status);
}


  // Get tasks for the authenticated user
 @Get('my-tasks')
async getMyTasks(@Request() req) {
  const user = await this.usersService.findById(req.user.id); // fetch full user entity
  return this.tasksService.getTasksByUser(user);
}


  // Update a task
  @Put(':id')
  async updateTask(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updates: Partial<{ title: string; description: string; status: TaskStatus }>,
  ) {
    const user = req.user;
    return this.tasksService.updateTask(id, updates, user);
  }

  // Delete a task
  @Delete(':id')
  async deleteTask(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const user = req.user;
    return this.tasksService.deleteTask(id, user);
  }
}
