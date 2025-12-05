import { Test, TestingModule } from '@nestjs/testing';
import { StreamingService } from './streaming.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

// Mock des modules
jest.mock('fs');

describe('StreamingService', () => {
  let service: StreamingService;

  const mockHttpService = {
    axiosRef: {},
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'STREAMING_BASE_URL') return 'http://mock-streaming-url.com';
      return null;
    }),
  };

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock fs functions
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.mkdirSync as jest.Mock).mockImplementation(() => undefined);
    (fs.readdir as unknown as jest.Mock).mockImplementation(
      (
        path: string,
        options: any,
        callback: (err: Error | null, files: any[]) => void,
      ) => {
        if (typeof callback === 'function') {
          callback(null, []);
        }
      },
    );
    (fs.rmSync as jest.Mock).mockImplementation(() => undefined);
    (fs.writeFileSync as jest.Mock).mockImplementation(() => undefined);
    (fs.statSync as jest.Mock).mockReturnValue({
      size: 1000,
      mtimeMs: Date.now(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamingService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<StreamingService>(StreamingService);
  });

  afterEach(() => {
    // Clean up timers
    jest.clearAllTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cleanupSession', () => {
    it('should remove session directory if it exists', () => {
      const sessionId = 'test-session-id';
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      service.cleanupSession(sessionId);

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.rmSync).toHaveBeenCalledWith(
        expect.stringContaining(sessionId),
        { recursive: true, force: true },
      );
    });

    it('should not throw error if session directory does not exist', () => {
      const sessionId = 'non-existent-session';
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      expect(() => service.cleanupSession(sessionId)).not.toThrow();
      expect(fs.rmSync).not.toHaveBeenCalled();
    });

    it('should handle cleanup for multiple sessions', () => {
      const sessionIds = ['session-1', 'session-2', 'session-3'];
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      sessionIds.forEach((id) => service.cleanupSession(id));

      expect(fs.rmSync).toHaveBeenCalledTimes(3);
      sessionIds.forEach((id) => {
        expect(fs.rmSync).toHaveBeenCalledWith(expect.stringContaining(id), {
          recursive: true,
          force: true,
        });
      });
    });
  });

  describe('stopHlsStream', () => {
    it('should call cleanupSession with the provided sessionId', () => {
      const sessionId = 'test-session-id';
      const cleanupSpy = jest.spyOn(service, 'cleanupSession');
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      service.stopHlsStream(sessionId);

      expect(cleanupSpy).toHaveBeenCalledWith(sessionId);
      expect(cleanupSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle stopping multiple streams', () => {
      const sessionIds = ['session-1', 'session-2'];
      const cleanupSpy = jest.spyOn(service, 'cleanupSession');
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      sessionIds.forEach((id) => service.stopHlsStream(id));

      expect(cleanupSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('onModuleDestroy', () => {
    it('should be callable without errors', () => {
      expect(() => service.onModuleDestroy()).not.toThrow();
    });
  });
});
