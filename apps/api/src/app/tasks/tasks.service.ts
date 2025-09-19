import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../../entities/task.entity';
import { User } from '../../entities/user.entity';
import { AuditLoggerService } from '../audit/audit.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    private readonly auditLogger: AuditLoggerService,
  ) {}

  async createTask(title: string, description: string, owner: User, status: TaskStatus = TaskStatus.PENDING) {
    console.log("task", title, description, owner, status);
    const task = this.taskRepo.create({ title, description, owner, status });
    console.log('Creating task:', task);
    const savedTask = await this.taskRepo.save(task);

    // Audit log
    this.auditLogger.logAction(owner.id, 'CREATE_TASK', { taskId: savedTask.id, title });

    return savedTask;
  }

  async getTasksByUser(user: User) {
    const tasks = await this.taskRepo.find({ where: { owner: user } });

    // Audit log
    this.auditLogger.logAction(user.id, 'VIEW_TASKS', { count: tasks.length });

    return tasks;
  }

  async updateTask(
    taskId: number,
    updates: Partial<{ title: string; description: string; status: TaskStatus }>,
    user?: User,
  ) {
    await this.taskRepo.update(taskId, updates);
    const updatedTask = await this.taskRepo.findOne({ where: { id: taskId } });

    // Audit log
    if (user) {
      this.auditLogger.logAction(user.id, 'UPDATE_TASK', { taskId, updates });
    }

    return updatedTask;
  }

  async deleteTask(taskId: number, user?: User) {
    const result = await this.taskRepo.delete(taskId);

    // Audit log
    if (user) {
      this.auditLogger.logAction(user.id, 'DELETE_TASK', { taskId });
    }

    return result;
  }
}
