import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Get,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto/login-user.dto';
import { User } from './entities/user/user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import { AuthService } from '../auth/auth.service'; // Import AuthService
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

// Définir une interface pour l'objet Request afin de typer req.user
interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService, // Inject AuthService
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Enregistrer un nouvel utilisateur' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Utilisateur enregistré avec succès',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "L'email existe déjà",
  })
  @ApiBody({ type: CreateUserDto })
  async register(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.usersService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Connecter un utilisateur' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Connexion réussie',
    schema: {
      properties: {
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Utilisateur non trouvé',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Identifiants invalides',
  })
  @ApiBody({ type: LoginUserDto })
  async login(
    @Body(ValidationPipe) loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string }> {
    return this.authService.login(loginUserDto); // Use authService.login
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtenir le profil de l'utilisateur connecté" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Profil de l'utilisateur",
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  getProfile(@Req() req: RequestWithUser): User {
    return req.user;
  }
}
