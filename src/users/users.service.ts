import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto/login-user.dto';
import { User } from './entities/user/user';
import { UserRole } from './user-role.enum';

@Injectable()
export class UsersService {
  private users: User[] = []; // Ceci est une implémentation simple pour le moment, à remplacer par une base de données

  async register(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password, roles } = createUserDto;

    const existingUser = this.users.find((user) => user.email === email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await (bcrypt.hash as any)(password, 10); // Hacher le mot de passe

    const newUser: User = {
      id: (this.users.length + 1).toString(), // Générer un ID simple
      username,
      email,
      password: hashedPassword,
      roles: roles || [UserRole.USER], // Par défaut, un nouvel utilisateur est un USER
    };

    this.users.push(newUser);
    // Retourner l'utilisateur sans le mot de passe haché
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = newUser;
    return result;
  }

  async login(loginUserDto: LoginUserDto): Promise<User> {
    const { email, password } = loginUserDto;

    const user = this.users.find((u) => u.email === email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await (bcrypt.compare as any)(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new ConflictException('Invalid credentials');
    }

    // Retourner l'utilisateur sans le mot de passe haché
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;
    return result;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return Promise.resolve(this.users.find((user) => user.email === email));
  }

  async findById(id: string): Promise<User | undefined> {
    return Promise.resolve(this.users.find((user) => user.id === id));
  }

  comparePassword(
    password: string,
    hashedPasswordFromDb: string,
  ): Promise<boolean> {
    return (bcrypt.compare as any)(password, hashedPasswordFromDb);
  }

  findAll(): Omit<User, 'password'>[] {
    return this.users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result;
    });
  }
}
