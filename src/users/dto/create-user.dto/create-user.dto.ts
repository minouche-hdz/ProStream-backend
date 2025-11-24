import { IsEmail, IsString, MinLength, IsArray, IsEnum } from 'class-validator';
import { UserRole } from '../../user-role.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];
}
