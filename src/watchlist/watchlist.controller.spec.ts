import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import { AddWatchlistItemDto } from './dto/add-watchlist-item.dto';
import { Watchlist } from './entities/watchlist.entity';
import { User } from '../users/entities/user/user';

describe('WatchlistController', () => {
  let controller: WatchlistController;

  const mockWatchlistService = {
    addToWatchlist: jest.fn(),
    removeFromWatchlist: jest.fn(),
    getWatchlist: jest.fn(),
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
      controllers: [WatchlistController],
      providers: [
        {
          provide: WatchlistService,
          useValue: mockWatchlistService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WatchlistController>(WatchlistController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addToWatchlist', () => {
    it('should add an item to the watchlist', async () => {
      const addDto: AddWatchlistItemDto = {
        tmdbId: 1,
        mediaType: 'movie',
        title: 'Movie Title',
        posterPath: '/poster.jpg',
      };
      const expectedResult: Watchlist = {
        id: 'watchlist1',
        userId: mockUser.id,
        tmdbId: addDto.tmdbId,
        mediaType: addDto.mediaType,
        title: addDto.title,
        posterPath: addDto.posterPath,
        user: mockUser,
      };

      mockWatchlistService.addToWatchlist.mockResolvedValue(expectedResult);

      const result = await controller.addToWatchlist(mockUser, addDto);

      expect(mockWatchlistService.addToWatchlist).toHaveBeenCalledWith(
        mockUser.id,
        addDto.tmdbId,
        addDto.mediaType,
        addDto.title,
        addDto.posterPath,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('removeFromWatchlist', () => {
    it('should remove an item from the watchlist', async () => {
      const tmdbId = 1;
      const mediaType = 'movie';

      mockWatchlistService.removeFromWatchlist.mockResolvedValue(undefined);

      const result = await controller.removeFromWatchlist(
        mockUser,
        tmdbId,
        mediaType,
      );

      expect(mockWatchlistService.removeFromWatchlist).toHaveBeenCalledWith(
        mockUser.id,
        tmdbId,
        mediaType,
      );
      expect(result).toEqual({ message: 'Item removed from watchlist' });
    });
  });

  describe('getWatchlist', () => {
    it('should return the watchlist for a user', async () => {
      const expectedResult: Watchlist[] = [
        {
          id: 'watchlist1',
          userId: mockUser.id,
          tmdbId: 1,
          mediaType: 'movie',
          title: 'Movie 1',
          posterPath: '/poster1.jpg',
          user: mockUser,
        },
      ];

      mockWatchlistService.getWatchlist.mockResolvedValue(expectedResult);

      const result = await controller.getWatchlist(mockUser);

      expect(mockWatchlistService.getWatchlist).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
