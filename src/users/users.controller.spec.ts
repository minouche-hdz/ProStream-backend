import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto/login-user.dto';
import { User } from './entities/user/user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import { UserRole } from './user-role.enum';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: User;
}

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser: User = {
    id: '1',
    nom: 'Test',
    prenom: 'User',
    email: 'test@example.com',
    password: 'hashedPassword',
    roles: [UserRole.USER],
    watchlists: [],
    viewingHistory: [],
  };

  const mockAuthService = {
    login: jest.fn(),
  };

  const mockUsersService = {
    register: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        nom: 'New',
        prenom: 'User',
        email: 'new@example.com',
        password: 'password123',
        roles: [UserRole.USER],
      };
      const registeredUser: User = {
        ...mockUser,
        id: '2',
        nom: createUserDto.nom,
        prenom: createUserDto.prenom,
        email: createUserDto.email,
        password: 'hashedPassword',
        roles: createUserDto.roles,
      };
      mockUsersService.register.mockResolvedValue(registeredUser);

      const result = await controller.register(createUserDto);
      expect(mockUsersService.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(registeredUser);
    });
  });

  describe('login', () => {
    it('should log in a user and return an access token', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const accessToken = { access_token: 'mockAccessToken' };
      mockAuthService.login.mockResolvedValue(accessToken);

      const result = await controller.login(loginUserDto);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginUserDto);
      expect(result).toEqual(accessToken);
    });
  });

  describe('getProfile', () => {
    it('should return the user profile from the request', () => {
      const requestWithUser = { user: mockUser } as unknown as RequestWithUser;
      const result = controller.getProfile(requestWithUser);
      expect(result).toEqual(mockUser);
    });
  });
});
