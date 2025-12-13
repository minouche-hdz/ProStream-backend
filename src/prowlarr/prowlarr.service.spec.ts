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
          title: 'Inception.2010.FRENCH.1080p.WEB.HDR10.H265-PiCKLES',
          size: 8482560512,
          publishDate: '2025-09-23T01:35:12Z',
          downloadUrl:
            'http://192.168.100.30:9696/3/download?apikey=fed2d94674884f05b08953d6b9781a98&link=eHl4UW9BQWZ0VDBwa2NBaFV1aldMY3ZiN093OFJRM013Z1lSNlI5VEZyaTh3WVArazR6WUZPWHA0c3FJK0dQWlM2S3prWkRDSnMyYkNGWUtwd1hxeC9nS0tJMmVzRWh5K3Q5TkVhaW50eTg9&file=Inception.2010.FRENCH.1080p.WEB.HDR10.H265-PiCKLES',
          guid: 'https://www.yggtorrent.top/engine/download_torrent?id=1369131',
          age: 66,
          ageHours: 1594.5480831944444,
          ageMinutes: 95672.88499167167,
          grabs: 103,
          indexerId: 3,
          indexer: 'YggTorrent',
          sortTitle: 'inception 2010 french 1080p web hdr10 h265 pickles',
          imdbId: 0,
          tmdbId: 0,
          tvdbId: 0,
          tvMazeId: 0,
          infoUrl:
            'https://www.yggtorrent.top/torrent/filmvid%C3%A9o/film/1369131-inception+2010+french+1080p+web+hdr10+h265-pickles',
          indexerFlags: [],
          seeders: 12,
          leechers: 0,
          protocol: 'torrent',
          fileName:
            'Inception.2010.FRENCH.1080p.WEB.HDR10.H265-PiCKLES.torrent',
        },
      ];
      const mockMappedResults: ProwlarrSearchResultDto = {
        results: [
          {
            title: 'Inception.2010.FRENCH.1080p.WEB.HDR10.H265-PiCKLES',
            size: 8482560512,
            publishDate: '2025-09-23T01:35:12Z',
            downloadUrl:
              'http://192.168.100.30:9696/3/download?apikey=fed2d94674884f05b08953d6b9781a98&link=eHl4UW9BQWZ0VDBwa2NBaFV1aldMY3ZiN093OFJRM013Z1lSNlI5VEZyaTh3WVArazR6WUZPWHA0c3FJK0dQWlM2S3prWkRDSnMyYkNGWUtwd1hxeC9nS0tJMmVzRWh5K3Q5TkVhaW50eTg9&file=Inception.2010.FRENCH.1080p.WEB.HDR10.H265-PiCKLES',
            guid: 'https://www.yggtorrent.top/engine/download_torrent?id=1369131',
            age: 66,
            ageHours: 1594.5480831944444,
            ageMinutes: 95672.88499167167,
            grabs: 103,
            indexerId: 3,
            indexer: 'YggTorrent',
            sortTitle: 'inception 2010 french 1080p web hdr10 h265 pickles',
            imdbId: 0,
            tmdbId: 0,
            tvdbId: 0,
            tvMazeId: 0,
            infoUrl:
              'https://www.yggtorrent.top/torrent/filmvid%C3%A9o/film/1369131-inception+2010+french+1080p+web+hdr10+h265-pickles',
            indexerFlags: [],
            seeders: 12,
            leechers: 0,
            protocol: 'torrent',
            fileName:
              'Inception.2010.FRENCH.1080p.WEB.HDR10.H265-PiCKLES.torrent',
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
