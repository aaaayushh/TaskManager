import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Role, User } from '../../entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      findByUsername: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if username and password are correct', async () => {
      const mockUser: User = {
        id: 1,
        username: 'test',
        password: await bcrypt.hash('password', 10),
        role: Role.ADMIN,
        organization: { id: 1, name: 'Org1', parent: null, children: [] },
      } as User;

      usersService.findByUsername.mockResolvedValue(mockUser);

      const result = await service.validateUser('test', 'password');

      expect(usersService.findByUsername).toHaveBeenCalledWith('test');
      expect(result).toEqual(mockUser);
    });

    it('should return null if username does not exist', async () => {
      usersService.findByUsername.mockResolvedValue(null);

      const result = await service.validateUser('unknown', 'password');

      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const mockUser: User = {
        id: 1,
        username: 'test',
        password: await bcrypt.hash('correctpassword', 10),
        role: Role.ADMIN,
        organization: { id: 1, name: 'Org1', parent: null, children: [] },
      } as User;

      usersService.findByUsername.mockResolvedValue(mockUser);

      const result = await service.validateUser('test', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      const mockUser: User = {
        id: 1,
        username: 'test',
        role: Role.ADMIN,
        organization: { id: 1, name: 'Org1', parent: null, children: [] },
        password: '',
      } as User;

      jwtService.sign.mockReturnValue('mocked-jwt-token');

      const result = await service.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
        role: mockUser.role,
        orgId: mockUser.organization.id,
      });
      expect(result).toEqual({ access_token: 'mocked-jwt-token' });
    });
  });
});
