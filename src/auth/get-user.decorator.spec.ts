import { Controller, Get } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetUser } from './get-user.decorator';
import { User } from '../users/entities/user/user';

// Define a dummy controller to test the decorator
@Controller()
class TestController {
  @Get()
  public testMethod(@GetUser() user: User | undefined) {
    return user;
  }
}

describe('GetUserDecorator', () => {
  let app: TestingModule;
  let testController: TestController;

  const mockUser: User = {
    id: 'user123',
    email: 'test@example.com',
    nom: 'Test',
    prenom: 'User',
    password: 'hashedPassword',
    roles: [],
    watchlists: [],
    viewingHistory: [],
  };

  beforeEach(async () => {
    app = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    testController = app.get<TestController>(TestController);
  });

  it('should return the user from the request', () => {
    const mockRequest = {
      user: mockUser,
    } as any;

    // Manually call the decorated method with a mock request
    const result = testController.testMethod(mockRequest.user);

    expect(result).toEqual(mockUser);
  });

  it('should return undefined if no user in request', () => {
    const mockRequest = {
      user: undefined,
    } as any;

    // Manually call the decorated method with a mock request
    const result = testController.testMethod(mockRequest.user);

    expect(result).toBeUndefined();
  });
});
