import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@src/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@src/users/entities/user/user';
import { Watchlist } from '@src/watchlist/entities/watchlist.entity';
import { ViewingHistory } from '@src/viewing-history/entities/viewing-history.entity';
import { AppModule } from './app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

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
      findById: jest.fn((id: string) => {
        if (id === '1') {
          return {
            id: '1',
            nom: 'Test',
            prenom: 'User',
            email: 'test@example.com',
            roles: ['user'],
            password: 'hashedpassword',
          };
        }
        return null;
      }),
      // Ajoutez d'autres méthodes mockées si nécessaire pour les tests
    };

    const mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockWatchlistRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };

    const mockViewingHistoryRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };

    appModule = await Test.createTestingModule({
      imports: [
        // Nous n'importons pas AppModule directement ici pour éviter la connexion à la BDD
        // Nous allons mocker les dépendances de AppModule
      ],
      controllers: [AppController],
      providers: [
        AppService,
        UsersService, // Le service UsersService est nécessaire pour les mocks
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Watchlist),
          useValue: mockWatchlistRepository,
        },
        {
          provide: getRepositoryToken(ViewingHistory),
          useValue: mockViewingHistoryRepository,
        },
      ],
    }).compile();
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
