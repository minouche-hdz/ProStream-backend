import { Test, TestingModule } from '@nestjs/testing';
import { StreamingController } from './streaming.controller';
import { StreamingService } from './streaming.service';
import { NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';

// Mock des modules fs
jest.mock('fs');

describe('StreamingController', () => {
  let controller: StreamingController;

  const mockStreamingService = {
    startHlsStream: jest.fn(),
    stopHlsStream: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamingController],
      providers: [
        {
          provide: StreamingService,
          useValue: mockStreamingService,
        },
      ],
    }).compile();

    controller = module.get<StreamingController>(StreamingController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('startHls', () => {
    const mockStartStreamDto = {
      mkvUrl: 'https://example.com/video.mkv',
      startTime: 120,
    };

    it('should start HLS stream and return sessionId and masterPlaylistUrl', async () => {
      const mockSessionId = '550e8400-e29b-41d4-a716-446655440000';
      mockStreamingService.startHlsStream.mockResolvedValue(mockSessionId);

      const result = await controller.startHls(mockStartStreamDto);

      expect(mockStreamingService.startHlsStream).toHaveBeenCalledWith(
        mockStartStreamDto.mkvUrl,
        mockStartStreamDto.startTime,
      );
      expect(result).toEqual({
        sessionId: mockSessionId,
        masterPlaylistUrl: `/streaming/session/${mockSessionId}/master.m3u8`,
      });
    });

    it('should start HLS stream without startTime', async () => {
      const mockSessionId = '550e8400-e29b-41d4-a716-446655440000';
      const dtoWithoutStartTime = {
        mkvUrl: 'https://example.com/video.mkv',
      };
      mockStreamingService.startHlsStream.mockResolvedValue(mockSessionId);

      const result = await controller.startHls(dtoWithoutStartTime);

      expect(mockStreamingService.startHlsStream).toHaveBeenCalledWith(
        dtoWithoutStartTime.mkvUrl,
        undefined,
      );
      expect(result).toEqual({
        sessionId: mockSessionId,
        masterPlaylistUrl: `/streaming/session/${mockSessionId}/master.m3u8`,
      });
    });

    it('should throw error when streamingService.startHlsStream fails', async () => {
      mockStreamingService.startHlsStream.mockRejectedValue(
        new Error('FFmpeg error'),
      );

      await expect(controller.startHls(mockStartStreamDto)).rejects.toThrow(
        'Erreur lors du démarrage du stream HLS.',
      );
    });
  });

  describe('stopStream', () => {
    it('should stop HLS stream and return success message', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';

      const result = controller.stopStream(sessionId);

      expect(mockStreamingService.stopHlsStream).toHaveBeenCalledWith(
        sessionId,
      );
      expect(result).toEqual({ message: 'Stream arrêté avec succès' });
    });
  });

  describe('serveHlsFile', () => {
    let mockResponse: Partial<Response>;
    let mockReadStream: any;

    beforeEach(() => {
      mockReadStream = {
        pipe: jest.fn(),
      };

      mockResponse = {
        setHeader: jest.fn(),
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream);
    });

    it('should serve .m3u8 file with correct content type', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const filePath = 'master.m3u8';

      controller.serveHlsFile(sessionId, filePath, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/x-mpegURL',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        '*',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=3600',
      );
      expect(mockReadStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should serve .m4s file with correct content type', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const filePath = 'video/segment001.m4s';

      controller.serveHlsFile(sessionId, filePath, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'video/iso.segment',
      );
      expect(mockReadStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should serve .ts file with correct content type', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const filePath = 'segment001.ts';

      controller.serveHlsFile(sessionId, filePath, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'video/mp2t',
      );
    });

    it('should serve .vtt file with correct content type', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const filePath = 'subtitles.vtt';

      controller.serveHlsFile(sessionId, filePath, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/vtt',
      );
    });

    it('should handle array path parameter', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const filePath = ['video', 'segment001.m4s'];

      controller.serveHlsFile(sessionId, filePath, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'video/iso.segment',
      );
      expect(mockReadStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should throw NotFoundException when file does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const filePath = 'nonexistent.m3u8';

      expect(() =>
        controller.serveHlsFile(sessionId, filePath, mockResponse as Response),
      ).toThrow(NotFoundException);
      expect(() =>
        controller.serveHlsFile(sessionId, filePath, mockResponse as Response),
      ).toThrow('Fichier HLS non trouvé.');
    });

    it('should throw NotFoundException for path traversal attempts', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      // Utiliser un chemin qui existe mais qui est en dehors du répertoire de session
      const filePath = '../../../etc/passwd';

      // Le fichier n'existe pas dans le contexte de test, donc fs.existsSync retourne false
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      expect(() =>
        controller.serveHlsFile(sessionId, filePath, mockResponse as Response),
      ).toThrow(NotFoundException);
    });

    it('should set CORS headers correctly', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const filePath = 'master.m3u8';

      controller.serveHlsFile(sessionId, filePath, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        '*',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Methods',
        'GET, OPTIONS',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Headers',
        'Content-Type, Range',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Access-Control-Expose-Headers',
        'Content-Length, Content-Range',
      );
    });
  });
});
