import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { AuthController } from '../src/auth.controller';
import { AuthService } from '../src/auth.service';
import { AuthForm } from '@app/shared-dto/dtos/auth-form.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let response: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    response = { cookie: jest.fn(), json: jest.fn() } as any;
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const loginDto: AuthForm = { username: 'user', password: 'password' };
      const result = { accessToken: 'mockAccessToken', refreshToken: 'mockRefreshToken' };
      jest.spyOn(authService, 'login').mockResolvedValue(result);

      const res = await authController.login(loginDto, {});

      expect(res).toEqual(result);
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const refreshToken = 'valid-refresh-token';
      jest.spyOn(authService, 'logout').mockResolvedValue(undefined);

      await expect(authController.logout({ cookies: { refreshToken } })).resolves.not.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should return new accessToken and refreshToken', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockAccessToken = 'new-access-token';
      const mockRefreshToken = 'new-refresh-token';
      const result = { accessToken: mockAccessToken, newRefreshToken: mockRefreshToken };

      jest.spyOn(authService, 'updateRefreshToken').mockResolvedValue(result);

      await authController.updateRefreshToken({ cookies: { refreshToken } }, response);

      expect(response.cookie).toHaveBeenCalledWith('refreshToken', mockRefreshToken, expect.any(Object));
      expect(response.json).toHaveBeenCalledWith({ accessToken: mockAccessToken });
    });
  });
});
