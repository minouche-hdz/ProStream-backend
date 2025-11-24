import { Test, TestingModule } from '@nestjs/testing';
import { StreamingService } from './streaming.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as fs from 'fs';
import { Readable } from 'stream';

// Mock fs module
jest.mock('fs', () => ({
  statSync: jest.fn(),
  createReadStream: jest.fn(() => {
    const mockStream = new Readable();
    mockStream._read = () => {}; // Implémentation minimale pour éviter les erreurs
    return mockStream;
  }),
}));

describe('StreamingService', () => {
  let service: StreamingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamingService,
        {
          provide: HttpService,
          useValue: {
            // Mock methods of HttpService here if needed
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'STREAMING_BASE_URL')
                return 'http://mock-streaming-url.com';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<StreamingService>(StreamingService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('streamFile', () => {
    const mockFilePath = '/path/to/video.mp4';
    const mockFileSize = 1000;
    let mockResponse: Response;
    let mockReadStream: Readable;

    beforeEach(() => {
      (fs.statSync as jest.Mock).mockReturnValue({ size: mockFileSize });

      mockReadStream = new Readable();
      mockReadStream._read = () => {};
      // Mock the pipe method of mockReadStream
      mockReadStream.pipe = jest.fn().mockImplementation(() => mockResponse);
      (fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream);

      // Mock Response object
      mockResponse = {
        req: { headers: {} }, // Ensure req.headers is always an object
        writeHead: jest.fn(),
        end: jest.fn(), // Add end method
        write: jest.fn(), // Add write method
        on: jest.fn(), // Add on method
        once: jest.fn(), // Add once method
        emit: jest.fn(), // Add emit method
      } as unknown as Response;
    });

    it('should stream the entire file if no range header is provided', () => {
      service.streamFile(mockFilePath, mockResponse);

      expect(fs.statSync).toHaveBeenCalledWith(mockFilePath);
      expect(mockResponse.writeHead).toHaveBeenCalledWith(200, {
        'Content-Length': mockFileSize,
        'Content-Type': 'video/mp4',
      });
      expect(fs.createReadStream).toHaveBeenCalledWith(mockFilePath);
      expect(mockReadStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should stream a partial file if a range header is provided', () => {
      const rangeHeader = 'bytes=0-499';
      const start = 0;
      const end = 499;
      const chunkSize = end - start + 1;

      mockResponse.req.headers.range = rangeHeader;

      service.streamFile(mockFilePath, mockResponse);

      expect(fs.statSync).toHaveBeenCalledWith(mockFilePath);
      expect(mockResponse.writeHead).toHaveBeenCalledWith(206, {
        'Content-Range': `bytes ${start}-${end}/${mockFileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });
      expect(fs.createReadStream).toHaveBeenCalledWith(mockFilePath, {
        start,
        end,
      });
      expect(mockReadStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle range header with only start byte', () => {
      const rangeHeader = 'bytes=500-';
      const start = 500;
      const end = mockFileSize - 1;
      const chunkSize = end - start + 1;

      mockResponse.req.headers.range = rangeHeader;

      service.streamFile(mockFilePath, mockResponse);

      expect(fs.statSync).toHaveBeenCalledWith(mockFilePath);
      expect(mockResponse.writeHead).toHaveBeenCalledWith(206, {
        'Content-Range': `bytes ${start}-${end}/${mockFileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });
      expect(fs.createReadStream).toHaveBeenCalledWith(mockFilePath, {
        start,
        end,
      });
      expect(mockReadStream.pipe).toHaveBeenCalledWith(mockResponse);
    });
  });
});
