import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from '@src/users/users.controller';
import { UsersService } from '@src/users/users.service';
import { AuthModule } from '@src/auth/auth.module'; // Import AuthModule
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@src/users/entities/user/user';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule)
  ], // Import AuthModule
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
