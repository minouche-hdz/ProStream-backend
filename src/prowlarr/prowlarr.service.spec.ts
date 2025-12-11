import { Test, TestingModule } from '@nestjs/testing';
import { ProwlarrService } from './prowlarr.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { ProwlarrIndexer, ProwlarrItem } from './interfaces/prowlarr.interface';
import { ProwlarrSearchResultDto } from './dto/prowlarr-responses.dto';

class MockConfigService {
  get = jest.fn((key: string) => {
    if (key === 'PROWLARR_API_KEY') return 'mockProwlarrApiKey';
    if (key === 'PROWLARR_BASE_URL') return 'http://mock-prowlarr-url.com';
    return null;
  });
}

describe('ProwlarrService', () => {
  let service: ProwlarrService;
  let httpService: HttpService;
  let configService: MockConfigService; // Use MockConfigService type

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProwlarrService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useClass: MockConfigService, // Use the mock class
        },
      ],
    }).compile();

    httpService = module.get<HttpService>(HttpService);
    configService = module.get<MockConfigService>(ConfigService); // Get instance of MockConfigService
    service = module.get<ProwlarrService>(ProwlarrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize PROWLARR_API_KEY and PROWLARR_BASE_URL from ConfigService', () => {
    // The constructor calls to configService.get should be captured here
    expect(configService.get).toHaveBeenCalledWith('PROWLARR_API_KEY');
    expect(configService.get).toHaveBeenCalledWith('PROWLARR_BASE_URL');
    expect(service['PROWLARR_API_KEY']).toEqual('mockProwlarrApiKey');
    expect(service['PROWLARR_BASE_URL']).toEqual(
      'http://mock-prowlarr-url.com',
    );
  });

  describe('search', () => {
    beforeEach(() => {
      // Clear httpService mocks before each search test
      (httpService.get as jest.Mock).mockClear();
    });

    it('should return search results', async () => {
      const mockRawResults: ProwlarrItem[] = [
        {
          title: 'Movie Title.mkv',
          size: 1000,
          publishDate: '2023-01-01',
          downloadUrl: 'download1',
        },
      ];
      const mockMappedResults: ProwlarrSearchResultDto = {
        results: [
          {
            title: 'Movie Title.mkv',
            size: 1000,
            publishDate: '2023-01-01',
            downloadUrl: 'download1',
          },
        ],
      };
      (httpService.get as jest.Mock).mockReturnValue(
        of({ data: mockRawResults }),
      );

      const result = await service.search('test query');
      expect(result).toEqual(mockMappedResults);
      expect(httpService.get).toHaveBeenCalledWith(
        `${service['PROWLARR_BASE_URL']}/api/v1/search`,
        {
          params: {
            apikey: service['PROWLARR_API_KEY'],
            query: 'test query',
          },
        },
      );
    });

    it('should throw an error if search API call fails', async () => {
      (httpService.get as jest.Mock).mockReturnValue(
        throwError(() => new Error('API error')),
      );
      await expect(service.search('test query')).rejects.toThrow('API error');
    });
  });

  describe('getIndexers', () => {
    beforeEach(() => {
      // Clear httpService mocks before each getIndexers test
      (httpService.get as jest.Mock).mockClear();
    });

    it('should return a list of indexers', async () => {
      const mockIndexers: ProwlarrIndexer[] = [
        {
          indexerUrls: ['http://indexer1.com'],
          definitionName: 'Indexer 1',
        },
      ];
      (httpService.get as jest.Mock).mockReturnValue(
        of({ data: mockIndexers }),
      );

      const result = await service.getIndexers();
      expect(result).toEqual(mockIndexers);
      expect(httpService.get).toHaveBeenCalledWith(
        `${service['PROWLARR_BASE_URL']}/api/v1/indexer`,
        {
          params: {
            apikey: service['PROWLARR_API_KEY'],
          },
        },
      );
    });

    it('should throw an error if getIndexers API call fails', async () => {
      (httpService.get as jest.Mock).mockReturnValue(
        throwError(() => new Error('API error')),
      );
      await expect(service.getIndexers()).rejects.toThrow('API error');
    });
  });
});
