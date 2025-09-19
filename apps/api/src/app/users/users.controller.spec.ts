import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '../../entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      createUser: jest.fn(),
      getAllUsers: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const body = { username: 'test', password: 'pass', role: Role.ADMIN, orgId: 1 };
      const mockUser = { id: 1, ...body };

      usersService.createUser.mockResolvedValue(mockUser);

      const result = await controller.register(body);

      expect(usersService.createUser).toHaveBeenCalledWith(body.username, body.password, body.role, body.orgId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', role: Role.ADMIN },
        { id: 2, username: 'user2', role: Role.OWNER },
      ];
      const req = { user: { id: 1, username: 'admin', role: Role.ADMIN } };

      usersService.getAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.getAll(req);

      expect(usersService.getAllUsers).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getById', () => {
    it('should return user by id', async () => {
      const mockUser = { id: 1, username: 'user1', role: Role.ADMIN };

      usersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getById(1);

      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });
});
