import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<Record<keyof AuthService, jest.Mock>>;

  beforeEach(async () => {
    authService = {
      validateUser: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return token if credentials are valid', async () => {
      const body = { username: 'test', password: 'pass' };
      const mockUser = { id: 1, username: 'test' };
      const mockToken = { access_token: 'jwt-token' };

      authService.validateUser.mockResolvedValue(mockUser);
      authService.login.mockReturnValue(mockToken);

      const result = await controller.login(body);

      expect(authService.validateUser).toHaveBeenCalledWith(body.username, body.password);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockToken);
    });

    it('should return error if credentials are invalid', async () => {
      const body = { username: 'test', password: 'wrongpass' };

      authService.validateUser.mockResolvedValue(null);

      const result = await controller.login(body);

      expect(authService.validateUser).toHaveBeenCalledWith(body.username, body.password);
      expect(result).toEqual({ error: 'Invalid credentials' });
    });
  });
});
