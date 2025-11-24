import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../users/entities/user/user';
import { UserRole } from '../../users/user-role.enum'; // Import UserRole enum

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'testsecret';
              return null;
            }),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return a user if valid payload and user exists', async () => {
      const mockUser: User = {
        id: '1',
        username: 'testuser', // Added username
        email: 'test@example.com',
        password: 'hashedpassword',
        roles: [UserRole.USER], // Use UserRole enum
      };
      (usersService.findById as jest.Mock).mockResolvedValue(mockUser);

      const payload = {
        sub: '1',
        email: 'test@example.com',
        roles: [UserRole.USER],
      };
      const result = await jwtStrategy.validate(payload);

      expect(usersService.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: [UserRole.USER],
      });
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      (usersService.findById as jest.Mock).mockResolvedValue(null);

      const payload = {
        sub: '1',
        email: 'test@example.com',
        roles: [UserRole.USER],
      };

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findById).toHaveBeenCalledWith('1');
    });
  });
});
