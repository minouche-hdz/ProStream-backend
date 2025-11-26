import { Test, TestingModule } from '@nestjs/testing';
import { ViewingHistoryService } from './viewing-history.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ViewingHistory } from './entities/viewing-history.entity';

describe('ViewingHistoryService', () => {
  let service: ViewingHistoryService;

  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    nom: 'Test',
    prenom: 'User',
    roles: [],
    watchlists: [],
    viewingHistory: [],
  };

  const mockViewingHistoryRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewingHistoryService,
        {
          provide: getRepositoryToken(ViewingHistory),
          useValue: mockViewingHistoryRepository,
        },
      ],
    }).compile();

    service = module.get<ViewingHistoryService>(ViewingHistoryService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateViewingHistory', () => {
    const userId = 'user123';
    const tmdbId = 1;
    const mediaType = 'movie';
    const title = 'Test Movie';
    const posterPath = '/test.jpg';
    const progress = 50;

    it('should create a new history item if not found', async () => {
      mockViewingHistoryRepository.findOne.mockResolvedValue(null);
      mockViewingHistoryRepository.create.mockReturnValue({
        userId,
        tmdbId,
        mediaType,
        title,
        posterPath,
        progress,
        lastWatched: expect.any(Date),
        user: mockUser,
      });
      mockViewingHistoryRepository.save.mockResolvedValue({
        id: 'history1',
        userId,
        tmdbId,
        mediaType,
        title,
        posterPath,
        progress,
        lastWatched: expect.any(Date),
        user: mockUser,
      });

      const result = await service.updateViewingHistory(
        userId,
        tmdbId,
        mediaType,
        title,
        posterPath,
        progress,
      );

      expect(mockViewingHistoryRepository.findOne).toHaveBeenCalledWith({
        where: { userId, tmdbId, mediaType },
      });
      expect(mockViewingHistoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          tmdbId,
          mediaType,
          title,
          posterPath,
          progress,
          lastWatched: expect.any(Date),
        }),
      );
      expect(mockViewingHistoryRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result.progress).toEqual(progress);
    });

    it('should update an existing history item if found', async () => {
      const existingHistoryItem = {
        id: 'history1',
        userId,
        tmdbId,
        mediaType,
        title,
        posterPath,
        progress: 20,
        lastWatched: new Date('2023-01-01'),
      };
      mockViewingHistoryRepository.findOne.mockResolvedValue(
        existingHistoryItem,
      );
      mockViewingHistoryRepository.save.mockResolvedValue({
        ...existingHistoryItem,
        progress,
        lastWatched: expect.any(Date),
      });

      const result = await service.updateViewingHistory(
        userId,
        tmdbId,
        mediaType,
        title,
        posterPath,
        progress,
      );

      expect(mockViewingHistoryRepository.findOne).toHaveBeenCalledWith({
        where: { userId, tmdbId, mediaType },
      });
      expect(mockViewingHistoryRepository.create).not.toHaveBeenCalled();
      expect(mockViewingHistoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...existingHistoryItem,
          progress,
          lastWatched: expect.any(Date),
        }),
      );
      expect(result.progress).toEqual(progress);
      expect(result.lastWatched).toEqual(expect.any(Date));
    });
  });

  describe('getViewingHistory', () => {
    it('should return all viewing history items for a user', async () => {
      const userId = 'user123';
      const mockHistoryItems: ViewingHistory[] = [
        {
          id: 'history1',
          userId,
          tmdbId: 1,
          mediaType: 'movie',
          title: 'Movie 1',
          posterPath: '/poster1.jpg',
          progress: 50,
          lastWatched: new Date(),
          user: mockUser,
        },
        {
          id: 'history2',
          userId,
          tmdbId: 2,
          mediaType: 'tv',
          title: 'TV Show 2',
          posterPath: '/poster2.jpg',
          progress: 80,
          lastWatched: new Date(),
          user: mockUser,
        },
      ];
      mockViewingHistoryRepository.find.mockResolvedValue(mockHistoryItems);

      const result = await service.getViewingHistory(userId);

      expect(mockViewingHistoryRepository.find).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual(mockHistoryItems);
    });

    it('should return an empty array if no history items are found', async () => {
      const userId = 'user123';
      mockViewingHistoryRepository.find.mockResolvedValue([]);

      const result = await service.getViewingHistory(userId);

      expect(mockViewingHistoryRepository.find).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual([]);
    });
  });

  describe('removeViewingHistoryItem', () => {
    it('should delete a history item', async () => {
      const userId = 'user123';
      const tmdbId = 1;
      const mediaType = 'movie';

      mockViewingHistoryRepository.delete.mockResolvedValue({ affected: 1 });

      await service.removeViewingHistoryItem(userId, tmdbId, mediaType);

      expect(mockViewingHistoryRepository.delete).toHaveBeenCalledWith({
        userId,
        tmdbId,
        mediaType,
      });
    });
  });
});
