import { IsEmail, IsString, MinLength, IsArray, IsEnum } from 'class-validator';
import { UserRole } from '../../user-role.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  nom: string;

  @IsString()
  @MinLength(2)
  prenom: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];
}
