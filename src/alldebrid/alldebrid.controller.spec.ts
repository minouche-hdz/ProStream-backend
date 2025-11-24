import { Test, TestingModule } from '@nestjs/testing';
import { AlldebridController } from './alldebrid.controller';
import { AlldebridService } from './alldebrid.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import {
  AlldebridMagnetUploadResponse,
  AlldebridStreamingLinkResponse,
  AlldebridMagnetStatusResponse,
} from './interfaces/alldebrid.interface';

describe('AlldebridController', () => {
  let controller: AlldebridController;
  // let service: AlldebridService;

  const mockAlldebridService = {
    urlToMagnet: jest.fn(),
    addMagnet: jest.fn(),
    getStreamingLink: jest.fn(),
    getMagnetStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlldebridController],
      providers: [
        {
          provide: AlldebridService,
          useValue: mockAlldebridService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // Bypass JwtAuthGuard for controller tests
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AlldebridController>(AlldebridController);
    // service = module.get<AlldebridService>(AlldebridService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addMagnet', () => {
    it('should convert URL to magnet and add it', async () => {
      const downloadUrl = 'http://example.com/torrent.torrent';
      const magnetLink = 'magnet:?xt=urn:btih:mockHash';
      const mockResponse: AlldebridMagnetUploadResponse = {
        status: 'success',
        data: {
          magnets: [
            {
              id: '1',
              hash: 'hash',
              filename: 'name',
              size: '100',
              status: 'uploading',
              download_url: 'url',
              files: [],
            },
          ],
        },
      };

      mockAlldebridService.urlToMagnet.mockResolvedValue(magnetLink);
      mockAlldebridService.addMagnet.mockResolvedValue(mockResponse);

      const result = await controller.addMagnet(downloadUrl);
      expect(mockAlldebridService.urlToMagnet).toHaveBeenCalledWith(
        downloadUrl,
      );
      expect(mockAlldebridService.addMagnet).toHaveBeenCalledWith(magnetLink);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getStreamingLink', () => {
    it('should return a streaming link', async () => {
      const link = 'http://alldebrid.com/link';
      const mockResponse: AlldebridStreamingLinkResponse = {
        status: 'success',
        data: {
          link: 'http://streaming.example.com',
          name: 'name',
          size: '100',
          type: 'video',
          streamable: true,
          files: [],
        },
      };

      mockAlldebridService.getStreamingLink.mockResolvedValue(mockResponse);

      const result = await controller.getStreamingLink(link);
      expect(mockAlldebridService.getStreamingLink).toHaveBeenCalledWith(link);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMagnetStatus', () => {
    it('should return magnet status', async () => {
      const magnetId = '123';
      const mockResponse: AlldebridMagnetStatusResponse = {
        status: 'success',
        data: {
          magnets: {
            '123': {
              id: '123',
              filename: 'file.mp4',
              size: 1000,
              hash: 'hash',
              status: 'ready',
              statusCode: 2,
              uploadDate: 123,
              completionDate: 'date',
              files: [],
            },
          },
        },
      };

      mockAlldebridService.getMagnetStatus.mockResolvedValue(mockResponse);

      const result = await controller.getMagnetStatus(magnetId);
      expect(mockAlldebridService.getMagnetStatus).toHaveBeenCalledWith(
        magnetId,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getStreamFromMagnet', () => {
    it('should return a streaming link from a magnet URL', async () => {
      const downloadUrl = 'http://example.com/torrent.torrent';
      const magnetLink = 'magnet:?xt=urn:btih:mockHash';
      const magnetUploadResponse: AlldebridMagnetUploadResponse = {
        status: 'success',
        data: {
          magnets: [
            {
              id: 'magnet123',
              hash: 'hash',
              filename: 'name',
              size: '100',
              status: 'uploading',
              download_url: 'url',
              files: [],
            },
          ],
        },
      };
      const magnetStatusResponse: AlldebridMagnetStatusResponse = {
        status: 'success',
        data: {
          magnets: {
            magnet123: {
              id: 'magnet123',
              filename: 'file.mp4',
              size: 1000,
              hash: 'hash',
              status: 'ready',
              statusCode: 2,
              uploadDate: 123,
              completionDate: 'date',
              files: [
                { n: 'file.mp4', s: 1000, l: 'http://alldebrid.com/filelink' },
              ],
            },
          },
        },
      };
      const streamingLinkResponse: AlldebridStreamingLinkResponse = {
        status: 'success',
        data: {
          link: 'http://streaming.example.com/stream',
          name: 'name',
          size: '100',
          type: 'video',
          streamable: true,
          files: [],
        },
      };

      mockAlldebridService.urlToMagnet.mockResolvedValue(magnetLink);
      mockAlldebridService.addMagnet.mockResolvedValue(magnetUploadResponse);
      mockAlldebridService.getMagnetStatus.mockResolvedValue(
        magnetStatusResponse,
      );
      mockAlldebridService.getStreamingLink.mockResolvedValue(
        streamingLinkResponse,
      );

      const result = await controller.getStreamFromMagnet(downloadUrl);

      expect(mockAlldebridService.urlToMagnet).toHaveBeenCalledWith(
        downloadUrl,
      );
      expect(mockAlldebridService.addMagnet).toHaveBeenCalledWith(magnetLink);
      expect(mockAlldebridService.getMagnetStatus).toHaveBeenCalledWith(
        'magnet123',
      );
      expect(mockAlldebridService.getStreamingLink).toHaveBeenCalledWith(
        'http://alldebrid.com/filelink',
      );
      expect(result).toEqual(streamingLinkResponse);
    });
  });
});
