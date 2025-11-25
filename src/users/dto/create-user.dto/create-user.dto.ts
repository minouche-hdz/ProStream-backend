import { IsEmail, IsString, MinLength, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: "Nom de l'utilisateur",
    minLength: 2,
    example: 'Doe',
  })
  @IsString()
  @MinLength(2)
  nom: string;

  @ApiProperty({
    description: "Prénom de l'utilisateur",
    minLength: 2,
    example: 'John',
  })
  @IsString()
  @MinLength(2)
  prenom: string;

  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    format: 'email',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Mot de passe de l'utilisateur",
    minLength: 6,
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: "Rôles de l'utilisateur",
    type: [String],
    enum: UserRole,
    example: [UserRole.USER],
  })
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];
}
