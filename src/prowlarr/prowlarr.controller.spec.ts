import { Test, TestingModule } from '@nestjs/testing';
import { ProwlarrController } from './prowlarr.controller';
import { ProwlarrService } from './prowlarr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import { ProwlarrIndexer } from './interfaces/prowlarr.interface';
import { ProwlarrSearchResultDto } from './dto/prowlarr-responses.dto';

describe('ProwlarrController', () => {
  let controller: ProwlarrController;
  // let service: ProwlarrService; // Commented out as it's not used

  const mockProwlarrService = {
    search: jest.fn(),
    getIndexers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProwlarrController],
      providers: [
        {
          provide: ProwlarrService,
          useValue: mockProwlarrService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // Bypass JwtAuthGuard for controller tests
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProwlarrController>(ProwlarrController);
    // service = module.get<ProwlarrService>(ProwlarrService); // Removed as it's not used

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should return search results from the service', async () => {
      const query = 'test query';
      const mockResults: ProwlarrSearchResultDto = {
        results: [
          {
            title: 'Movie 1',
            size: 100,
            publishDate: '2023-01-01',
            downloadUrl: 'url1',
            guid: 'guid1',
            age: 1,
            ageHours: 24,
            ageMinutes: 1440,
            grabs: 10,
            indexerId: 1,
            indexer: 'IndexerName',
            sortTitle: 'movie 1',
            imdbId: 123,
            tmdbId: 456,
            tvdbId: 789,
            tvMazeId: 101,
            infoUrl: 'infoUrl1',
            indexerFlags: [],
            seeders: 5,
            leechers: 2,
            protocol: 'torrent',
            fileName: 'movie1.torrent',
          },
        ],
      };
      mockProwlarrService.search.mockResolvedValue(mockResults);

      const result = await controller.search(query);
      expect(mockProwlarrService.search).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResults);
    });
  });

  describe('getIndexers', () => {
    it('should return a list of indexers from the service', async () => {
      const mockIndexers: ProwlarrIndexer[] = [
        { indexerUrls: ['url1'], definitionName: 'Indexer 1' },
      ];
      mockProwlarrService.getIndexers.mockResolvedValue(mockIndexers);

      const result = await controller.getIndexers();
      expect(mockProwlarrService.getIndexers).toHaveBeenCalled();
      expect(result).toEqual(mockIndexers);
    });
  });
});
