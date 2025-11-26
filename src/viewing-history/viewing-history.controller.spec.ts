import { Test, TestingModule } from '@nestjs/testing';
import { ViewingHistoryController } from './viewing-history.controller';
import { ViewingHistoryService } from './viewing-history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import { UpdateViewingHistoryDto } from './dto/update-viewing-history.dto';
import { ViewingHistory } from './entities/viewing-history.entity';
import { User } from '../users/entities/user/user';

describe('ViewingHistoryController', () => {
  let controller: ViewingHistoryController;

  const mockViewingHistoryService = {
    updateViewingHistory: jest.fn(),
    getViewingHistory: jest.fn(),
    removeViewingHistoryItem: jest.fn(),
  };

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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ViewingHistoryController],
      providers: [
        {
          provide: ViewingHistoryService,
          useValue: mockViewingHistoryService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ViewingHistoryController>(ViewingHistoryController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateViewingHistory', () => {
    it('should update or create a viewing history item', async () => {
      const updateDto: UpdateViewingHistoryDto = {
        tmdbId: 1,
        mediaType: 'movie',
        title: 'Movie Title',
        posterPath: '/poster.jpg',
        progress: 50,
      };
      const expectedResult: ViewingHistory = {
        id: 'history1',
        userId: mockUser.id,
        tmdbId: updateDto.tmdbId,
        mediaType: updateDto.mediaType,
        title: updateDto.title,
        posterPath: updateDto.posterPath,
        progress: updateDto.progress,
        lastWatched: new Date(),
        user: mockUser,
      };

      mockViewingHistoryService.updateViewingHistory.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.updateViewingHistory(mockUser, updateDto);

      expect(
        mockViewingHistoryService.updateViewingHistory,
      ).toHaveBeenCalledWith(
        mockUser.id,
        updateDto.tmdbId,
        updateDto.mediaType,
        updateDto.title,
        updateDto.posterPath,
        updateDto.progress,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getViewingHistory', () => {
    it('should return the viewing history for a user', async () => {
      const expectedResult: ViewingHistory[] = [
        {
          id: 'history1',
          userId: mockUser.id,
          tmdbId: 1,
          mediaType: 'movie',
          title: 'Movie 1',
          posterPath: '/poster1.jpg',
          progress: 50,
          lastWatched: new Date(),
          user: mockUser,
        },
      ];

      mockViewingHistoryService.getViewingHistory.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getViewingHistory(mockUser);

      expect(mockViewingHistoryService.getViewingHistory).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('removeViewingHistoryItem', () => {
    it('should remove a viewing history item', async () => {
      const tmdbId = 1;
      const mediaType = 'movie';

      mockViewingHistoryService.removeViewingHistoryItem.mockResolvedValue(
        undefined,
      );

      const result = await controller.removeViewingHistoryItem(
        mockUser,
        tmdbId,
        mediaType,
      );

      expect(
        mockViewingHistoryService.removeViewingHistoryItem,
      ).toHaveBeenCalledWith(mockUser.id, tmdbId, mediaType);
      expect(result).toEqual({ message: 'Item removed from viewing history' });
    });
  });
});
