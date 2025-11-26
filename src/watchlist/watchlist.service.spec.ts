import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistService } from './watchlist.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Watchlist } from './entities/watchlist.entity';

describe('WatchlistService', () => {
  let service: WatchlistService;

  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    nom: 'Test',
    prenom: 'User',
    roles: [],
    watchlists: [],
    viewingHistory: [],
  };

  const mockWatchlistRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistService,
        {
          provide: getRepositoryToken(Watchlist),
          useValue: mockWatchlistRepository,
        },
      ],
    }).compile();

    service = module.get<WatchlistService>(WatchlistService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToWatchlist', () => {
    const userId = 'user123';
    const tmdbId = 1;
    const mediaType = 'movie';
    const title = 'Test Movie';
    const posterPath = '/test.jpg';

    it('should add a new item to the watchlist if not found', async () => {
      mockWatchlistRepository.findOne.mockResolvedValue(null);
      mockWatchlistRepository.create.mockReturnValue({
        userId,
        tmdbId,
        mediaType,
        title,
        posterPath,
        user: mockUser,
      });
      mockWatchlistRepository.save.mockResolvedValue({
        id: 'watchlist1',
        userId,
        tmdbId,
        mediaType,
        title,
        posterPath,
        user: mockUser,
      });

      const result = await service.addToWatchlist(
        userId,
        tmdbId,
        mediaType,
        title,
        posterPath,
      );

      expect(mockWatchlistRepository.findOne).toHaveBeenCalledWith({
        where: { userId, tmdbId, mediaType },
      });
      expect(mockWatchlistRepository.create).toHaveBeenCalledWith({
        userId,
        tmdbId,
        mediaType,
        title,
        posterPath,
      });
      expect(mockWatchlistRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result.title).toEqual(title);
    });

    it('should return the existing item if already in watchlist', async () => {
      const existingItem = {
        id: 'watchlist1',
        userId,
        tmdbId,
        mediaType,
        title,
        posterPath,
      };
      mockWatchlistRepository.findOne.mockResolvedValue(existingItem);

      const result = await service.addToWatchlist(
        userId,
        tmdbId,
        mediaType,
        title,
        posterPath,
      );

      expect(mockWatchlistRepository.findOne).toHaveBeenCalledWith({
        where: { userId, tmdbId, mediaType },
      });
      expect(mockWatchlistRepository.create).not.toHaveBeenCalled();
      expect(mockWatchlistRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual(existingItem);
    });
  });

  describe('removeFromWatchlist', () => {
    it('should delete an item from the watchlist', async () => {
      const userId = 'user123';
      const tmdbId = 1;
      const mediaType = 'movie';

      mockWatchlistRepository.delete.mockResolvedValue({ affected: 1 });

      await service.removeFromWatchlist(userId, tmdbId, mediaType);

      expect(mockWatchlistRepository.delete).toHaveBeenCalledWith({
        userId,
        tmdbId,
        mediaType,
      });
    });
  });

  describe('getWatchlist', () => {
    it('should return all watchlist items for a user', async () => {
      const userId = 'user123';
      const mockWatchlistItems: Watchlist[] = [
        {
          id: 'watchlist1',
          userId,
          tmdbId: 1,
          mediaType: 'movie',
          title: 'Movie 1',
          posterPath: '/poster1.jpg',
          user: mockUser,
        },
        {
          id: 'watchlist2',
          userId,
          tmdbId: 2,
          mediaType: 'tv',
          title: 'TV Show 2',
          posterPath: '/poster2.jpg',
          user: mockUser,
        },
      ];
      mockWatchlistRepository.find.mockResolvedValue(mockWatchlistItems);

      const result = await service.getWatchlist(userId);

      expect(mockWatchlistRepository.find).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual(mockWatchlistItems);
    });

    it('should return an empty array if no watchlist items are found', async () => {
      const userId = 'user123';
      mockWatchlistRepository.find.mockResolvedValue([]);

      const result = await service.getWatchlist(userId);

      expect(mockWatchlistRepository.find).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual([]);
    });
  });
});
