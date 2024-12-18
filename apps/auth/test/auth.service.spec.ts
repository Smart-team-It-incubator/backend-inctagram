import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthForm } from '@app/shared-dto/dtos/auth-form.dto';
import { AuthController } from '../src/auth.controller';
import { AuthService } from '../src/auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    const loginDto: AuthForm = { email: 'testuser@example.com', password: 'testpass' }; // Example DTO

    it('should return accessToken and set refreshToken in cookie on successful login', async () => {
      const result = {
        accessToken: 'someAccessToken',
        refreshToken: 'someRefreshToken',
      };

      mockAuthService.login.mockResolvedValue(result);

      const res = {
        cookie: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      const req = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        cookies: {},
      };

      await authController.login(loginDto, res, req);

      expect(res.cookie).toHaveBeenCalledWith('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ accessToken: result.accessToken });
    });

    it('should throw 401 error if login fails due to invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      const res = {};
      const req = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        cookies: {},
      };

      await expect(authController.login(loginDto, res, req)).rejects.toThrow(HttpException);
      await expect(authController.login(loginDto, res, req)).rejects.toThrow('Invalid credentials');
      //await expect(authController.login(loginDto, res, req)).rejects.toThrow(new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED));
    });

    it('should throw 409 error if an active session exists', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Active session exists'));

      const res = {};
      const req = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        cookies: {},
      };

      await expect(authController.login(loginDto, res, req)).rejects.toThrow(HttpException);
      await expect(authController.login(loginDto, res, req)).rejects.toThrow('Уже существует активная сессия для устройства с этим Refresh Token, если нужно обновить, обратись на refresh-token.');
      //await expect(authController.login(loginDto, res, req)).rejects.toThrow(new HttpException('Conflict', HttpStatus.CONFLICT),);
    });

    it('should handle cases where refreshToken exists in cookies', async () => {
      const result = {
        accessToken: 'someAccessToken',
        refreshToken: 'someRefreshToken',
      };

      mockAuthService.login.mockResolvedValue(result);

      const res = {
        cookie: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      const req = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        cookies: { refreshToken: 'existingRefreshToken' },
      };

      await authController.login(loginDto, res, req);

      expect(res.cookie).toHaveBeenCalledWith('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ accessToken: result.accessToken });
    });

    it('should throw an error if an unexpected error occurs', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Unexpected error'));

      const res = {};
      const req = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        cookies: {},
      };

      await expect(authController.login(loginDto, res, req)).rejects.toThrow(HttpException);
      await expect(authController.login(loginDto, res, req)).rejects.toThrow('Unexpected error');
      //await expect(authController.login(loginDto, res, req)).rejects.toThrow(new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED));
    });
  });
});
