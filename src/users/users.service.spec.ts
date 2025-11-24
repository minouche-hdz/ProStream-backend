import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '@src/users/users.service';
import { CreateUserDto } from '@src/users/dto/create-user.dto/create-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@src/users/user-role.enum';
import { LoginUserDto } from '@src/users/dto/login-user.dto/login-user.dto';
import { User } from '@src/users/entities/user/user';
import { Repository } from 'typeorm';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn((password: string) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password: string, hashedPassword: string) =>
    Promise.resolve(password === hashedPassword.replace('hashed_', '')),
  ),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      nom: 'Test',
      prenom: 'User',
      email: 'test@example.com',
      password: 'password123',
      roles: [UserRole.USER],
    };

    it('should successfully register a new user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        id: '1',
        ...createUserDto,
        password: 'hashed_password123',
      });
      mockUserRepository.save.mockResolvedValue({
        id: '1',
        ...createUserDto,
        password: 'hashed_password123',
      });

      const user = await service.register(createUserDto);
      expect(user).toBeDefined();
      expect(user.email).toEqual(createUserDto.email);
      expect(user.nom).toEqual(createUserDto.nom);
      expect(user.prenom).toEqual(createUserDto.prenom);
      expect(user.roles).toEqual([UserRole.USER]);
      expect(user).not.toHaveProperty('password');
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        password: 'hashed_password123',
        roles: [UserRole.USER],
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ email: createUserDto.email });

      await expect(service.register(createUserDto)).rejects.toThrow(
        new ConflictException('Email already exists'),
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should assign default USER role if no roles are provided', async () => {
      const userWithoutRoleDto: CreateUserDto = {
        ...createUserDto,
        email: 'no-role@example.com',
        roles: undefined as any,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        id: '2',
        ...userWithoutRoleDto,
        roles: [UserRole.USER],
        password: 'hashed_password123',
      });
      mockUserRepository.save.mockResolvedValue({
        id: '2',
        ...userWithoutRoleDto,
        roles: [UserRole.USER],
        password: 'hashed_password123',
      });

      const user = await service.register(userWithoutRoleDto);
      expect(user.roles).toEqual([UserRole.USER]);
    });
  });

  describe('login', () => {
    const loginUserDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    const hashedPassword = 'hashed_password123';
    const registeredUser: User = {
      id: '1',
      nom: 'Test',
      prenom: 'User',
      email: 'test@example.com',
      password: hashedPassword,
      roles: [UserRole.USER],
      watchlists: [],
      viewingHistory: [],
    };

    it('should successfully log in a user with valid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(registeredUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const user = await service.login(loginUserDto);
      expect(user).toBeDefined();
      expect(user.email).toEqual(loginUserDto.email);
      expect(user).not.toHaveProperty('password');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginUserDto.password,
        registeredUser.password,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginUserDto)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });

    it('should throw ConflictException for invalid credentials (wrong password)', async () => {
      mockUserRepository.findOne.mockResolvedValue(registeredUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginUserDto)).rejects.toThrow(
        new ConflictException('Invalid credentials'),
      );
    });
  });

  describe('findByEmail', () => {
    const registeredUser: User = {
      id: '1',
      nom: 'Test',
      prenom: 'User',
      email: 'test@example.com',
      password: 'hashed_password123',
      roles: [UserRole.USER],
      watchlists: [],
      viewingHistory: [],
    };

    it('should return a user if found by email', async () => {
      mockUserRepository.findOne.mockResolvedValue(registeredUser);
      const user = await service.findByEmail('test@example.com');
      expect(user).toBeDefined();
      expect(user?.email).toEqual('test@example.com');
    });

    it('should return null if user not found by email', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const user = await service.findByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    const registeredUser: User = {
      id: '1',
      nom: 'Test',
      prenom: 'User',
      email: 'test@example.com',
      password: 'hashed_password123',
      roles: [UserRole.USER],
      watchlists: [],
      viewingHistory: [],
    };

    it('should return a user if found by id', async () => {
      mockUserRepository.findOne.mockResolvedValue(registeredUser);
      const user = await service.findById('1');
      expect(user).toBeDefined();
      expect(user?.id).toEqual('1');
    });

    it('should return null if user not found by id', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const user = await service.findById('999');
      expect(user).toBeNull();
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.comparePassword(
        'password123',
        'hashed_password123',
      );
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashed_password123',
      );
    });

    it('should return false for non-matching passwords', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await service.comparePassword(
        'wrongpassword',
        'hashed_password123',
      );
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        'hashed_password123',
      );
    });
  });

  describe('findAll', () => {
    const user1: User = {
      id: '1',
      nom: 'User',
      prenom: 'One',
      email: 'user1@example.com',
      password: 'hashed_password1',
      roles: [UserRole.USER],
      watchlists: [],
      viewingHistory: [],
    };
    const user2: User = {
      id: '2',
      nom: 'User',
      prenom: 'Two',
      email: 'user2@example.com',
      password: 'hashed_password2',
      roles: [UserRole.ADMIN],
      watchlists: [],
      viewingHistory: [],
    };

    it('should return all users without their passwords', async () => {
      mockUserRepository.find.mockResolvedValue([user1, user2]);
      const allUsers = await service.findAll();
      expect(allUsers.length).toBe(2);
      expect(allUsers[0]).not.toHaveProperty('password');
      expect(allUsers[1]).not.toHaveProperty('password');
      expect(allUsers[0].email).toEqual('user1@example.com');
      expect(allUsers[1].email).toEqual('user2@example.com');
    });

    it('should return an empty array if no users exist', async () => {
      mockUserRepository.find.mockResolvedValue([]);
      const allUsers = await service.findAll();
      expect(allUsers).toEqual([]);
    });
  });
});
