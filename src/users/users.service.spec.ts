import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from './user-role.enum';
import { LoginUserDto } from './dto/login-user.dto/login-user.dto';
import { User } from './entities/user/user';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn((password: string) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password: string, hashedPassword: string) =>
    Promise.resolve(password === hashedPassword.replace('hashed_', '')),
  ),
}));

describe('UsersService', () => {
  let service: UsersService;
  let users: User[]; // Déclarer users ici pour un typage correct

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    // Réinitialiser le tableau des utilisateurs avant chaque test
    users = [];
    (service as any).users = users; // Accéder à la propriété privée pour la réinitialiser
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      roles: [UserRole.USER],
    };

    it('should successfully register a new user', async () => {
      const user = await service.register(createUserDto);
      expect(user).toBeDefined();
      expect(user.email).toEqual(createUserDto.email);
      expect(user.username).toEqual(createUserDto.username);
      expect(user.roles).toEqual([UserRole.USER]);
      expect(user).not.toHaveProperty('password'); // Le mot de passe ne doit pas être retourné
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(users.length).toBe(1);
    });

    it('should throw ConflictException if email already exists', async () => {
      await service.register(createUserDto); // Enregistrer un utilisateur une première fois
      await expect(service.register(createUserDto)).rejects.toThrow(
        new ConflictException('Email already exists'),
      );
      expect(users.length).toBe(1); // Le nombre d'utilisateurs ne doit pas changer
    });

    it('should assign default USER role if no roles are provided', async () => {
      const userWithoutRoleDto: CreateUserDto = {
        ...createUserDto,
        email: 'no-role@example.com',
        roles: undefined as any, // Tester le cas où roles est undefined
      };
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
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      roles: [UserRole.USER],
    };

    beforeEach(() => {
      users.push(registeredUser);
    });

    it('should successfully log in a user with valid credentials', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Mock bcrypt.compare pour retourner true
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
      users.splice(0, users.length); // Vider les utilisateurs
      await expect(service.login(loginUserDto)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });

    it('should throw ConflictException for invalid credentials (wrong password)', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Mock bcrypt.compare pour retourner false
      await expect(service.login(loginUserDto)).rejects.toThrow(
        new ConflictException('Invalid credentials'),
      );
    });
  });

  describe('findByEmail', () => {
    const registeredUser: User = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed_password123',
      roles: [UserRole.USER],
    };

    beforeEach(() => {
      users.push(registeredUser);
    });

    it('should return a user if found by email', async () => {
      const user = await service.findByEmail('test@example.com');
      expect(user).toBeDefined();
      expect(user?.email).toEqual('test@example.com');
    });

    it('should return undefined if user not found by email', async () => {
      const user = await service.findByEmail('nonexistent@example.com');
      expect(user).toBeUndefined();
    });
  });

  describe('findById', () => {
    const registeredUser: User = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed_password123',
      roles: [UserRole.USER],
    };

    beforeEach(() => {
      users.push(registeredUser);
    });

    it('should return a user if found by id', async () => {
      const user = await service.findById('1');
      expect(user).toBeDefined();
      expect(user?.id).toEqual('1');
    });

    it('should return undefined if user not found by id', async () => {
      const user = await service.findById('999');
      expect(user).toBeUndefined();
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
      username: 'user1',
      email: 'user1@example.com',
      password: 'hashed_password1',
      roles: [UserRole.USER],
    };
    const user2: User = {
      id: '2',
      username: 'user2',
      email: 'user2@example.com',
      password: 'hashed_password2',
      roles: [UserRole.ADMIN],
    };

    beforeEach(() => {
      users.push(user1, user2);
    });

    it('should return all users without their passwords', () => {
      const allUsers = service.findAll();
      expect(allUsers.length).toBe(2);
      expect(allUsers[0]).not.toHaveProperty('password');
      expect(allUsers[1]).not.toHaveProperty('password');
      expect(allUsers[0].email).toEqual('user1@example.com');
      expect(allUsers[1].email).toEqual('user2@example.com');
    });

    it('should return an empty array if no users exist', () => {
      users.splice(0, users.length); // Vider les utilisateurs
      const allUsers = service.findAll();
      expect(allUsers).toEqual([]);
    });
  });
});
