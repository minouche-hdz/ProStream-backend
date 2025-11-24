import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service'; // Import UsersService

describe('AppModule', () => {
  let appModule: TestingModule;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'testsecret';
        return null;
      }),
    };

    const mockUsersService = {
      findById: jest.fn(() => ({
        id: '1',
        email: 'test@example.com',
        roles: ['user'],
        password: 'hashedpassword',
      })),
    };

    appModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();
  });

  it('should compile the module', () => {
    expect(appModule).toBeDefined();
  });

  it('should provide the AppService', () => {
    const appService = appModule.get<AppService>(AppService);
    expect(appService).toBeInstanceOf(AppService);
  });

  it('should provide the AppController', () => {
    const appController = appModule.get<AppController>(AppController);
    expect(appController).toBeInstanceOf(AppController);
  });
});
