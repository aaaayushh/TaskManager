import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { UsersService } from '../users/users.service';
import { TaskStatus } from '../../entities/task.entity';
import { Role } from '../../entities/user.entity';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: Partial<Record<keyof TasksService, jest.Mock>>;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;

  beforeEach(async () => {
    tasksService = {
      createTask: jest.fn(),
      getTasksByUser: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
    };

    usersService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: TasksService, useValue: tasksService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTask', () => {
    it('should create a task', async () => {
      const mockUser = { id: 1, username: 'test', role: Role.VIEWER }; // use any valid Role
      const req = { user: mockUser };
      const body = { title: 'Test Task', description: 'desc', status: TaskStatus.PENDING }; // use valid TaskStatus

      usersService.findById.mockResolvedValue(mockUser);
      tasksService.createTask.mockResolvedValue({ id: 1, ...body, owner: mockUser });

      const result = await controller.createTask(req, body);

      expect(usersService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(tasksService.createTask).toHaveBeenCalledWith(
        body.title,
        body.description,
        mockUser,
        body.status,
      );
      expect(result).toEqual({ id: 1, ...body, owner: mockUser });
    });

    it('should throw error if user not found', async () => {
      usersService.findById.mockResolvedValue(null);
      const req = { user: { id: 1 } };
      const body = { title: 'Test Task' };

      await expect(controller.createTask(req, body)).rejects.toThrow('User not found');
    });
  });

  describe('getMyTasks', () => {
    it('should return tasks for the user', async () => {
      const mockUser = { id: 1, username: 'test' };
      const tasks = [{ id: 1, title: 'Task 1' }];
      const req = { user: mockUser };

      usersService.findById.mockResolvedValue(mockUser);
      tasksService.getTasksByUser.mockResolvedValue(tasks);

      const result = await controller.getMyTasks(req);

      expect(usersService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(tasksService.getTasksByUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(tasks);
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const mockUser = { id: 1 };
      const req = { user: mockUser };
      const updates = { title: 'Updated Task' };
      const taskId = 1;

      tasksService.updateTask.mockResolvedValue({ id: taskId, ...updates, owner: mockUser });

      const result = await controller.updateTask(req, taskId, updates);

      expect(tasksService.updateTask).toHaveBeenCalledWith(taskId, updates, mockUser);
      expect(result).toEqual({ id: taskId, ...updates, owner: mockUser });
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const mockUser = { id: 1 };
      const req = { user: mockUser };
      const taskId = 1;

      tasksService.deleteTask.mockResolvedValue({ deleted: true });

      const result = await controller.deleteTask(req, taskId);

      expect(tasksService.deleteTask).toHaveBeenCalledWith(taskId, mockUser);
      expect(result).toEqual({ deleted: true });
    });
  });
});
