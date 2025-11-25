import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from '../users/dto/login-user.dto/login-user.dto';
import { UserRole } from '../users/user-role.enum';
import { User } from '../users/entities/user/user';
import { CreateUserDto } from '../users/dto/create-user.dto/create-user.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    nom: 'Test',
    prenom: 'User',
    password: 'hashedPassword',
    roles: [UserRole.USER],
    watchlists: [],
    viewingHistory: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            comparePassword: jest.fn(),
            login: jest.fn(),
            register: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mockAccessToken'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user if validation is successful', async () => {
      (
        usersService.findByEmail as unknown as jest.Mock<Promise<User | null>>
      ).mockResolvedValue(mockUser);
      (
        usersService.comparePassword as unknown as jest.Mock<Promise<boolean>>
      ).mockResolvedValue(true);

      const result = await service.validateUser(
        mockUser.email,
        'plainPassword',
      );
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        nom: mockUser.nom,
        prenom: mockUser.prenom,
        roles: mockUser.roles,
        watchlists: [],
        viewingHistory: [],
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(usersService.comparePassword).toHaveBeenCalledWith(
        'plainPassword',
        mockUser.password,
      );
    });

    it('should return null if user is not found', async () => {
      (
        usersService.findByEmail as unknown as jest.Mock<Promise<User | null>>
      ).mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password',
      );
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      (
        usersService.findByEmail as unknown as jest.Mock<Promise<User | null>>
      ).mockResolvedValue(mockUser);
      (
        usersService.comparePassword as unknown as jest.Mock<Promise<boolean>>
      ).mockResolvedValue(false);

      const result = await service.validateUser(
        mockUser.email,
        'wrongPassword',
      );
      expect(result).toBeNull();
    });

    it('should return null if user has no password', async () => {
      const userWithoutPassword = { ...mockUser, password: undefined };
      (
        usersService.findByEmail as unknown as jest.Mock<Promise<User | null>>
      ).mockResolvedValue(userWithoutPassword);

      const result = await service.validateUser(
        mockUser.email,
        'plainPassword',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const loginUserDto: LoginUserDto = {
      email: mockUser.email,
      password: 'plainPassword',
    };

    it('should return an access token if login is successful', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = mockUser;
      (
        usersService.login as unknown as jest.Mock<
          Promise<Omit<User, 'password'>>
        >
      ).mockResolvedValue(userWithoutPassword);

      const result = await service.login(loginUserDto);
      expect(result).toEqual({ access_token: 'mockAccessToken' });
      expect(usersService.login).toHaveBeenCalledWith(loginUserDto);
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        roles: mockUser.roles,
      });
    });

    it('should throw UnauthorizedException if user login fails', async () => {
      (
        usersService.login as unknown as jest.Mock<
          Promise<Omit<User, 'password'> | null>
        >
      ).mockResolvedValue(null);

      await expect(service.login(loginUserDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      nom: 'New',
      prenom: 'User',
      email: 'new@example.com',
      password: 'newpassword',
      roles: [UserRole.USER],
    };

    it('should register a new user successfully', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = mockUser;
      (
        usersService.register as unknown as jest.Mock<
          Promise<Omit<User, 'password'>>
        >
      ).mockResolvedValue(userWithoutPassword);

      const result = await service.register(createUserDto);
      expect(result).toEqual(userWithoutPassword);
      expect(usersService.register).toHaveBeenCalledWith(createUserDto);
    });
  });
});
