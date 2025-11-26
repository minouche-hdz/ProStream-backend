import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@src/users/entities/user/user';
import { RequestWithUser } from './interfaces/request-with-user.interface'; // Import the interface

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>(); // Use the interface here
    return request.user;
  },
);
