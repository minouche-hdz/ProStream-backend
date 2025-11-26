import { Request } from 'express';
import { User } from '@src/users/entities/user/user';

export interface RequestWithUser extends Request {
  user: User;
}
