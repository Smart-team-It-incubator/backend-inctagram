import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { CoreAppApiService } from '@core-app-api/core-app-api';
import { AuthService } from '../src/auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let coreAppApiService: CoreAppApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        CoreAppApiService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    coreAppApiService = module.get<CoreAppApiService>(CoreAppApiService);
  });

  describe('login', () => {
    it('should return accessToken and refreshToken on successful login', async () => {
      const loginDto = { username: 'UserWithHash', password: 'password123' };
      const userResponse = {
        username: 'UserWithHash',
        password: await bcrypt.hash('password123', 10),
      };

      jest.spyOn(coreAppApiService, 'getUserByUsername').mockResolvedValue(userResponse);

      const tokens = await authService.login(loginDto);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const loginDto = { username: 'NonExistingUser', password: 'password123' };

      jest.spyOn(coreAppApiService, 'getUserByUsername').mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto = { username: 'UserWithHash', password: 'wrongpassword' };
      const userResponse = {
        username: 'UserWithHash',
        password: await bcrypt.hash('password123', 10),
      };

      jest.spyOn(coreAppApiService, 'getUserByUsername').mockResolvedValue(userResponse);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
