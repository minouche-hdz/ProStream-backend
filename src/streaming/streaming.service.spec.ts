import { Test, TestingModule } from '@nestjs/testing';
import { StreamingService } from './streaming.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import ffmpeg from 'fluent-ffmpeg';
import { ChildProcess } from 'child_process';

// Mock des modules
jest.mock('fs');
jest.mock('path');
jest.mock('os');

jest.mock('fluent-ffmpeg', () => {
  const mockFfmpegCommand = {
    outputOptions: jest.fn().mockReturnThis(),
    output: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    run: jest.fn(),
    seekInput: jest.fn().mockReturnThis(),
    ffmpegProc: {
      kill: jest.fn(),
    },
  };

  const mockFfprobe = jest.fn((url, callback) => {
    callback(null, {
      streams: [
        {
          index: 0,
          codec_type: 'video',
          codec_name: 'h264',
          width: 1920,
          height: 1080,
          bit_rate: 1000000,
        },
        {
          index: 1,
          codec_type: 'audio',
          codec_name: 'aac',
          tags: { language: 'eng' },
        },
      ],
    });
  });

  const fluentFfmpeg = jest.fn(() => mockFfmpegCommand);
  (fluentFfmpeg as any).ffprobe = mockFfprobe;
  (fluentFfmpeg as any).setFfmpegPath = jest.fn();
  (fluentFfmpeg as any).setFfprobePath = jest.fn();

  return {
    __esModule: true,
    default: fluentFfmpeg,
    ffprobe: mockFfprobe,
    mockFfmpegCommand: mockFfmpegCommand,
  };
});

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

// Import the mocked variables
import { mockFfmpegCommand, ffprobe as mockFfprobe } from 'fluent-ffmpeg';

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

  let module: TestingModule;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    (fs.existsSync as jest.Mock).mockImplementation((p: string) =>
      p === '/app' ? false : true,
    );
    (fs.mkdirSync as jest.Mock).mockImplementation(() => undefined);
    (fs.readdir as unknown as jest.Mock).mockImplementation(
      (
        dirPath: string,
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

    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    (os.tmpdir as jest.Mock).mockReturnValue('/tmp');

    module = await Test.createTestingModule({
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
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    let setIntervalSpy: jest.SpyInstance;
    let clearIntervalSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers();
      (fs.mkdirSync as jest.Mock).mockImplementation(() => undefined);
      setIntervalSpy = jest.spyOn(global, 'setInterval');
      clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });

    it('should create HLS_TEMP_DIR if it does not exist', () => {
      (fs.existsSync as jest.Mock).mockImplementation((p: string) =>
        p === '/app' ? false : false,
      );
      (path.join as jest.Mock).mockReturnValueOnce('/tmp/prostream_hls');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const constructorService = new StreamingService(
        mockHttpService as unknown as HttpService,
        mockConfigService as unknown as ConfigService,
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith('/tmp/prostream_hls', {
        recursive: true,
      });
    });

    it('should not create HLS_TEMP_DIR if it exists', () => {
      (fs.existsSync as jest.Mock).mockImplementation((p: string) =>
        p === '/app' ? false : true,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const constructorService = new StreamingService(
        mockHttpService as unknown as HttpService,
        mockConfigService as unknown as ConfigService,
      );
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should start the cleanup timer', () => {
      (fs.existsSync as jest.Mock).mockImplementation((p: string) =>
        p === '/app' ? false : true,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const constructorService = new StreamingService(
        mockHttpService as unknown as HttpService,
        mockConfigService as unknown as ConfigService,
      );
      expect(setIntervalSpy).toHaveBeenCalledTimes(1);
      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        5 * 60 * 1000,
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should stop the cleanup timer and cleanup all sessions', () => {
      const stopCleanupTimerSpy = jest.spyOn(
        service as any,
        'stopCleanupTimer',
      );
      const cleanupAllSessionsSpy = jest.spyOn(
        service as any,
        'cleanupAllSessions',
      );

      service.onModuleDestroy();

      expect(stopCleanupTimerSpy).toHaveBeenCalledTimes(1);
      expect(cleanupAllSessionsSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('startCleanupTimer', () => {
    let setIntervalSpy: jest.SpyInstance;
    let clearIntervalSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers();
      setIntervalSpy = jest.spyOn(global, 'setInterval');
      clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      service = new StreamingService(
        mockHttpService as unknown as HttpService,
        mockConfigService as unknown as ConfigService,
      );
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });

    it('should set a cleanup timer', () => {
      (service as any).stopCleanupTimer();
      (service as any).startCleanupTimer();
      expect(setIntervalSpy).toHaveBeenCalledTimes(2);
      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        5 * 60 * 1000,
      );
    });
  });

  describe('stopCleanupTimer', () => {
    let setIntervalSpy: jest.SpyInstance;
    let clearIntervalSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers();
      setIntervalSpy = jest.spyOn(global, 'setInterval');
      clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      service = new StreamingService(
        mockHttpService as unknown as HttpService,
        mockConfigService as unknown as ConfigService,
      );
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });

    it('should clear the cleanup timer if it exists', () => {
      (service as any).stopCleanupTimer();
      expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
      expect((service as any).cleanupTimer).toBeNull();
    });

    it('should not clear the cleanup timer if it does not exist', () => {
      (service as any).stopCleanupTimer();
      clearIntervalSpy.mockClear();
      (service as any).stopCleanupTimer();
      expect(clearIntervalSpy).not.toHaveBeenCalled();
    });
  });

  describe('cleanupInactiveSessions', () => {
    it('should remove inactive session directories', () => {
      const oldSessionDir = 'old-session';
      const recentSessionDir = 'recent-session';
      const now = Date.now();
      const SESSION_TIMEOUT_MS = 60 * 60 * 1000;

      (fs.readdir as unknown as jest.Mock).mockImplementationOnce(
        (
          dirPath: string,
          options: any,
          callback: (err: Error | null, entries: any[]) => void,
        ) => {
          callback(null, [
            { name: oldSessionDir, isDirectory: () => true },
            { name: recentSessionDir, isDirectory: () => true },
          ]);
        },
      );

      (fs.statSync as jest.Mock)
        .mockReturnValueOnce({ mtimeMs: now - SESSION_TIMEOUT_MS - 1000 }) // Old session
        .mockReturnValueOnce({ mtimeMs: now - 1000 }); // Recent session

      const cleanupSessionSpy = jest.spyOn(service, 'cleanupSession');

      jest.advanceTimersByTime(5 * 60 * 1000); // Advance past cleanup interval

      expect(cleanupSessionSpy).toHaveBeenCalledWith(oldSessionDir);
      expect(cleanupSessionSpy).not.toHaveBeenCalledWith(recentSessionDir);
      expect(cleanupSessionSpy).toHaveBeenCalledTimes(1);
    });

    it('should log an error if readdir fails', () => {
      const loggerErrorSpy = jest.spyOn((service as any).logger, 'error');
      (fs.readdir as unknown as jest.Mock).mockImplementationOnce(
        (
          dirPath: string,
          options: any,
          callback: (err: Error | null, entries: any[]) => void,
        ) => {
          callback(new Error('readdir error'), []);
        },
      );

      jest.advanceTimersByTime(5 * 60 * 1000);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Erreur lors de la lecture du répertoire temporaire HLS',
        ),
      );
    });

    it('should log a warning if statSync fails', () => {
      const loggerWarnSpy = jest.spyOn((service as any).logger, 'warn');
      (fs.readdir as unknown as jest.Mock).mockImplementationOnce(
        (
          dirPath: string,
          options: any,
          callback: (err: Error | null, entries: any[]) => void,
        ) => {
          callback(null, [{ name: 'bad-session', isDirectory: () => true }]);
        },
      );
      (fs.statSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('stat error');
      });

      jest.advanceTimersByTime(5 * 60 * 1000);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Impossible de statuer le répertoire'),
      );
    });
  });

  describe('cleanupAllSessions', () => {
    it('should remove all session directories', () => {
      const session1 = 'session-1';
      const session2 = 'session-2';

      (fs.readdir as unknown as jest.Mock).mockImplementationOnce(
        (
          dirPath: string,
          options: any,
          callback: (err: Error | null, entries: any[]) => void,
        ) => {
          callback(null, [
            { name: session1, isDirectory: () => true },
            { name: session2, isDirectory: () => true },
            { name: 'file.txt', isDirectory: () => false }, // Should be ignored
          ]);
        },
      );

      const cleanupSessionSpy = jest.spyOn(service, 'cleanupSession');

      (service as any).cleanupAllSessions();

      expect(cleanupSessionSpy).toHaveBeenCalledWith(session1);
      expect(cleanupSessionSpy).toHaveBeenCalledWith(session2);
      expect(cleanupSessionSpy).toHaveBeenCalledTimes(2);
    });

    it('should log an error if readdir fails during cleanupAllSessions', () => {
      const loggerErrorSpy = jest.spyOn((service as any).logger, 'error');
      (fs.readdir as unknown as jest.Mock).mockImplementationOnce(
        (
          dirPath: string,
          options: any,
          callback: (err: Error | null, entries: any[]) => void,
        ) => {
          callback(new Error('readdir error for global cleanup'), []);
        },
      );

      (service as any).cleanupAllSessions();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Erreur lors de la lecture du répertoire temporaire HLS pour le nettoyage global',
        ),
      );
    });
  });

  describe('cleanupSession', () => {
    it('should remove session directory if it exists', () => {
      const sessionId = 'test-session-id';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const stopFfmpegProcessSpy = jest.spyOn(
        service as any,
        'stopFfmpegProcess',
      );

      service.cleanupSession(sessionId);

      expect(fs.existsSync).toHaveBeenCalled();
      expect(stopFfmpegProcessSpy).toHaveBeenCalledWith(`video-${sessionId}`);
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
      const stopFfmpegProcessSpy = jest.spyOn(
        service as any,
        'stopFfmpegProcess',
      );

      sessionIds.forEach((id) => service.cleanupSession(id));

      expect(fs.rmSync).toHaveBeenCalledTimes(3);
      sessionIds.forEach((id) => {
        expect(fs.rmSync).toHaveBeenCalledWith(expect.stringContaining(id), {
          recursive: true,
          force: true,
        });
        expect(stopFfmpegProcessSpy).toHaveBeenCalledWith(`video-${id}`);
      });
    });

    it('should stop associated audio ffmpeg processes', () => {
      const sessionId = 'test-session-id';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const stopFfmpegProcessSpy = jest.spyOn(
        service as any,
        'stopFfmpegProcess',
      );

      // Simulate active audio processes
      (service as any).activeFfmpegProcesses.set(
        `audio-${sessionId}-0`,
        mockFfmpegCommand.ffmpegProc,
      );
      (service as any).activeFfmpegProcesses.set(
        `audio-${sessionId}-1`,
        mockFfmpegCommand.ffmpegProc,
      );

      service.cleanupSession(sessionId);

      expect(stopFfmpegProcessSpy).toHaveBeenCalledWith(`audio-${sessionId}-0`);
      expect(stopFfmpegProcessSpy).toHaveBeenCalledWith(`audio-${sessionId}-1`);
      expect((service as any).activeFfmpegProcesses.size).toBe(0);
    });
  });

  describe('stopFfmpegProcess', () => {
    it('should kill the ffmpeg process and remove it from active processes', () => {
      const key = 'video-session-id';
      const mockProcess = { kill: jest.fn() } as unknown as ChildProcess;
      (service as any).activeFfmpegProcesses.set(key, mockProcess);

      (service as any).stopFfmpegProcess(key);

      expect(mockProcess.kill).toHaveBeenCalledWith('SIGKILL');
      expect((service as any).activeFfmpegProcesses.has(key)).toBe(false);
    });

    it('should do nothing if the process key does not exist', () => {
      const key = 'non-existent-key';
      const mockProcess = { kill: jest.fn() } as unknown as ChildProcess;
      (service as any).activeFfmpegProcesses.set('some-other-key', mockProcess);

      (service as any).stopFfmpegProcess(key);

      expect(mockProcess.kill).not.toHaveBeenCalled();
      expect((service as any).activeFfmpegProcesses.has('some-other-key')).toBe(
        true,
      );
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

  describe('probeStream', () => {
    it('should return metadata on successful probing', async () => {
      const mockUrl = 'http://mock-url/video.mkv';
      const mockMetadata = {
        streams: [{ index: 0, codec_type: 'video', codec_name: 'h264' }],
      };
      mockFfprobe.mockImplementationOnce((url, callback) => {
        callback(null, mockMetadata);
      });

      const metadata = await (service as any).probeStream(mockUrl);
      expect(mockFfprobe).toHaveBeenCalledWith(mockUrl, expect.any(Function));
      expect(metadata).toEqual(mockMetadata);
    });

    it('should throw an error on failed probing', async () => {
      const mockUrl = 'http://mock-url/bad-video.mkv';
      const mockError = new Error('FFprobe failed');
      mockFfprobe.mockImplementationOnce((url, callback) => {
        callback(mockError, null);
      });

      await expect((service as any).probeStream(mockUrl)).rejects.toThrow(
        `FFprobe error: ${mockError.message}`,
      );
      expect(mockFfprobe).toHaveBeenCalledWith(mockUrl, expect.any(Function));
    });
  });

  describe('startHlsStream', () => {
    const mkvUrl = 'http://example.com/video.mkv';
    const sessionId = 'mock-uuid';
    const sessionDir = `/tmp/prostream_hls/${sessionId}`;
    const videoDir = `${sessionDir}/video`;
    const audioDir = `${sessionDir}/audio_0`;
    const videoPlaylistPath = `${videoDir}/video.m3u8`;
    const audioPlaylistPath = `${audioDir}/audio_eng_0.m3u8`;

    beforeEach(() => {
      jest.spyOn(service as any, 'probeStream').mockResolvedValue({
        streams: [
          {
            index: 0,
            codec_type: 'video',
            codec_name: 'h264',
            width: 1920,
            height: 1080,
            bit_rate: 1000000,
          },
          {
            index: 1,
            codec_type: 'audio',
            codec_name: 'aac',
            tags: { language: 'eng' },
          },
        ],
      });
      jest
        .spyOn(service as any, 'startVideoConversion')
        .mockImplementation(() => {});
      jest
        .spyOn(service as any, 'startAudioConversion')
        .mockImplementation(() => {});
      jest.spyOn(service as any, 'waitForFile').mockResolvedValue(undefined);
      jest.spyOn(service, 'cleanupSession').mockImplementation(() => {});
    });

    it('should create session directories and return a session ID', async () => {
      const result = await service.startHlsStream(mkvUrl);

      expect(fs.mkdirSync).toHaveBeenCalledWith(sessionDir, {
        recursive: true,
      });
      expect(fs.mkdirSync).toHaveBeenCalledWith(videoDir, { recursive: true });
      expect(fs.mkdirSync).toHaveBeenCalledWith(audioDir, { recursive: true });
      expect(result).toBe(sessionId);
    });

    it('should call probeStream with the correct URL', async () => {
      await service.startHlsStream(mkvUrl);
      expect((service as any).probeStream).toHaveBeenCalledWith(mkvUrl);
    });

    it('should throw an error if no video stream is found', async () => {
      jest.spyOn(service as any, 'probeStream').mockResolvedValueOnce({
        streams: [
          {
            index: 1,
            codec_type: 'audio',
            codec_name: 'aac',
            tags: { language: 'eng' },
          },
        ],
      });

      await expect(service.startHlsStream(mkvUrl)).rejects.toThrow(
        'Aucune piste vidéo trouvée dans le fichier MKV.',
      );
      expect(service.cleanupSession).toHaveBeenCalledWith(sessionId);
    });

    it('should start video and audio conversions', async () => {
      await service.startHlsStream(mkvUrl);

      expect((service as any).startVideoConversion).toHaveBeenCalledWith(
        mkvUrl,
        0, // video stream index
        videoPlaylistPath,
        `${videoDir}/segment%03d.m4s`,
        sessionId,
        undefined,
      );
      expect((service as any).startAudioConversion).toHaveBeenCalledWith(
        mkvUrl,
        1, // audio stream index
        audioPlaylistPath,
        `${audioDir}/segment%03d.m4s`,
        sessionId,
        0, // audio index
        undefined,
      );
    });

    it('should wait for playlist files to be created', async () => {
      await service.startHlsStream(mkvUrl);

      expect((service as any).waitForFile).toHaveBeenCalledWith(
        videoPlaylistPath,
        60000,
      );
      expect((service as any).waitForFile).toHaveBeenCalledWith(
        audioPlaylistPath,
        60000,
      );
    });

    it('should create the master playlist file', async () => {
      await service.startHlsStream(mkvUrl);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `${sessionDir}/master.m3u8`,
        expect.stringContaining('#EXTM3U\n#EXT-X-VERSION:6\n'),
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `${sessionDir}/master.m3u8`,
        expect.stringContaining('video/video.m3u8'),
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `${sessionDir}/master.m3u8`,
        expect.stringContaining('audio_0/audio_eng_0.m3u8'),
      );
    });

    it('should cleanup session on error during stream setup', async () => {
      jest
        .spyOn(service as any, 'probeStream')
        .mockRejectedValueOnce(new Error('Probe failed'));

      await expect(service.startHlsStream(mkvUrl)).rejects.toThrow(
        'Probe failed',
      );
      expect(service.cleanupSession).toHaveBeenCalledWith(sessionId);
    });

    it('should create the master playlist file without audio streams if none are found', async () => {
      jest.spyOn(service as any, 'probeStream').mockResolvedValueOnce({
        streams: [
          {
            index: 0,
            codec_type: 'video',
            codec_name: 'h264',
            width: 1920,
            height: 1080,
            bit_rate: 1000000,
          },
        ],
      });

      await service.startHlsStream(mkvUrl);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `${sessionDir}/master.m3u8`,
        expect.stringContaining('#EXTM3U\n#EXT-X-VERSION:6\n'),
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `${sessionDir}/master.m3u8`,
        expect.stringContaining('video/video.m3u8'),
      );
      expect(fs.writeFileSync).not.toHaveBeenCalledWith(
        `${sessionDir}/master.m3u8`,
        expect.stringContaining('AUDIO="audio"'),
      );
    });

    it('should pass startTime to conversions if provided', async () => {
      const startTime = 30;
      await service.startHlsStream(mkvUrl, startTime);

      expect((service as any).startVideoConversion).toHaveBeenCalledWith(
        mkvUrl,
        0,
        videoPlaylistPath,
        `${videoDir}/segment%03d.m4s`,
        sessionId,
        startTime,
      );
      expect((service as any).startAudioConversion).toHaveBeenCalledWith(
        mkvUrl,
        1,
        audioPlaylistPath,
        `${audioDir}/segment%03d.m4s`,
        sessionId,
        0,
        startTime,
      );
    });
  });

  describe('startVideoConversion and startAudioConversion', () => {
    const mkvUrl = 'http://example.com/video.mkv';
    const sessionId = 'mock-uuid';
    const streamIndex = 0;
    const playlistPath = '/tmp/prostream_hls/mock-uuid/video/video.m3u8';
    const segmentPath = '/tmp/prostream_hls/mock-uuid/video/segment%03d.m4s';
    const audioIndex = 0;

    beforeEach(() => {
      mockFfmpegCommand.outputOptions.mockClear();
      mockFfmpegCommand.output.mockClear();
      mockFfmpegCommand.on.mockClear();
      mockFfmpegCommand.run.mockClear();
      mockFfmpegCommand.seekInput.mockClear(); // Nettoyer le mock de seekInput
      (mockFfmpegCommand.ffmpegProc.kill as jest.Mock).mockClear(); // Nettoyer le mock de kill
      (fs.existsSync as jest.Mock).mockReturnValue(true); // Ensure directory exists for error handling
    });

    it('should configure and run ffmpeg for video conversion', () => {
      (service as any).startVideoConversion(
        mkvUrl,
        streamIndex,
        playlistPath,
        segmentPath,
        sessionId,
      );

      expect(ffmpeg).toHaveBeenCalledWith(mkvUrl);
      expect(mockFfmpegCommand.outputOptions).toHaveBeenCalledWith(
        expect.arrayContaining([
          '-map',
          `0:${streamIndex}`,
          '-c:v',
          'copy',
          '-f',
          'hls',
          '-hls_time',
          '2',
          '-hls_list_size',
          '0',
          '-hls_segment_type',
          'fmp4',
          '-hls_flags',
          'independent_segments',
          '-hls_playlist_type',
          'event',
          '-hls_segment_filename',
          segmentPath,
          '-movflags',
          '+faststart+frag_keyframe',
          '-frag_duration',
          '2000000',
          '-min_frag_duration',
          '2000000',
          '-g',
          '48',
          '-sc_threshold',
          '0',
        ]),
      );
      expect(mockFfmpegCommand.output).toHaveBeenCalledWith(playlistPath);
      expect(mockFfmpegCommand.run).toHaveBeenCalledTimes(1);
    });

    it('should configure and run ffmpeg for audio conversion', () => {
      (service as any).startAudioConversion(
        mkvUrl,
        streamIndex,
        playlistPath,
        segmentPath,
        sessionId,
        audioIndex,
      );

      expect(ffmpeg).toHaveBeenCalledWith(mkvUrl);
      expect(mockFfmpegCommand.outputOptions).toHaveBeenCalledWith(
        expect.arrayContaining([
          '-map',
          `0:${streamIndex}`,
          '-c:a',
          'aac',
          '-f',
          'hls',
          '-hls_time',
          '2',
          '-hls_list_size',
          '0',
          '-hls_segment_type',
          'fmp4',
          '-hls_flags',
          'independent_segments',
          '-hls_playlist_type',
          'event',
          '-hls_segment_filename',
          segmentPath,
          '-movflags',
          '+faststart+frag_keyframe',
          '-frag_duration',
          '2000000',
          '-min_frag_duration',
          '2000000',
        ]),
      );
      expect(mockFfmpegCommand.output).toHaveBeenCalledWith(playlistPath);
      expect(mockFfmpegCommand.run).toHaveBeenCalledTimes(1);
    });

    it('should add ffmpeg process to activeFfmpegProcesses on start for video', () => {
      (service as any).startVideoConversion(
        mkvUrl,
        streamIndex,
        playlistPath,
        segmentPath,
        sessionId,
      );
      const startCallback = mockFfmpegCommand.on.mock.calls.find(
        (call) => call[0] === 'start',
      )[1];
      startCallback('command line');
      expect(
        (service as any).activeFfmpegProcesses.has(`video-${sessionId}`),
      ).toBe(true);
    });

    it('should add ffmpeg process to activeFfmpegProcesses on start for audio', () => {
      (service as any).startAudioConversion(
        mkvUrl,
        streamIndex,
        playlistPath,
        segmentPath,
        sessionId,
        audioIndex,
      );
      const startCallback = mockFfmpegCommand.on.mock.calls.find(
        (call) => call[0] === 'start',
      )[1];
      startCallback('command line');
      expect(
        (service as any).activeFfmpegProcesses.has(
          `audio-${sessionId}-${audioIndex}`,
        ),
      ).toBe(true);
    });

    it('should remove ffmpeg process and cleanup session on error for video', () => {
      const cleanupSessionSpy = jest.spyOn(service, 'cleanupSession');
      (service as any).startVideoConversion(
        mkvUrl,
        streamIndex,
        playlistPath,
        segmentPath,
        sessionId,
      );
      const errorCallback = mockFfmpegCommand.on.mock.calls.find(
        (call) => call[0] === 'error',
      )[1];
      errorCallback(new Error('ffmpeg error'), '', '');
      expect(
        (service as any).activeFfmpegProcesses.has(`video-${sessionId}`),
      ).toBe(false);
      expect(cleanupSessionSpy).toHaveBeenCalledWith(sessionId);
    });

    it('should ignore ffmpeg error if session directory no longer exists for video', () => {
      const cleanupSessionSpy = jest.spyOn(service, 'cleanupSession');
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false); // Simulate directory not existing
      (service as any).startVideoConversion(
        mkvUrl,
        streamIndex,
        playlistPath,
        segmentPath,
        sessionId,
      );
      const errorCallback = mockFfmpegCommand.on.mock.calls.find(
        (call) => call[0] === 'error',
      )[1];
      errorCallback(new Error('ffmpeg error'), '', '');
      expect(cleanupSessionSpy).not.toHaveBeenCalled(); // Cleanup should not be called again
    });

    it('should remove ffmpeg process and cleanup session on error for audio', () => {
      const cleanupSessionSpy = jest.spyOn(service, 'cleanupSession');
      (service as any).startAudioConversion(
        mkvUrl,
        streamIndex,
        playlistPath,
        segmentPath,
        sessionId,
        audioIndex,
      );
      const errorCallback = mockFfmpegCommand.on.mock.calls.find(
        (call) => call[0] === 'error',
      )[1];
      errorCallback(new Error('ffmpeg error'), '', '');
      expect(
        (service as any).activeFfmpegProcesses.has(
          `audio-${sessionId}-${audioIndex}`,
        ),
      ).toBe(false);
      expect(cleanupSessionSpy).toHaveBeenCalledWith(sessionId);
    });

    it('should ignore ffmpeg error if session directory no longer exists for audio', () => {
      const cleanupSessionSpy = jest.spyOn(service, 'cleanupSession');
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false); // Simulate directory not existing
      (service as any).startAudioConversion(
        mkvUrl,
        streamIndex,
        playlistPath,
        segmentPath,
        sessionId,
        audioIndex,
      );
      const errorCallback = mockFfmpegCommand.on.mock.calls.find(
        (call) => call[0] === 'error',
      )[1];
      errorCallback(new Error('ffmpeg error'), '', '');
      expect(cleanupSessionSpy).not.toHaveBeenCalled(); // Cleanup should not be called again
    });

    it('should remove ffmpeg process on end for video', () => {
      (service as any).startVideoConversion(
        mkvUrl,
        streamIndex,
        playlistPath,
        segmentPath,
        sessionId,
      );
      const endCallback = mockFfmpegCommand.on.mock.calls.find(
        (call) => call[0] === 'end',
      )[1];
      endCallback();
      expect(
        (service as any).activeFfmpegProcesses.has(`video-${sessionId}`),
      ).toBe(false);
    });

    it('should remove ffmpeg process on end for audio', () => {
      (service as any).startAudioConversion(
        mkvUrl,
        streamIndex,
        playlistPath,
        segmentPath,
        sessionId,
        audioIndex,
      );
      const endCallback = mockFfmpegCommand.on.mock.calls.find(
        (call) => call[0] === 'end',
      )[1];
      endCallback();
      expect(
        (service as any).activeFfmpegProcesses.has(
          `audio-${sessionId}-${audioIndex}`,
        ),
      ).toBe(false);
    });

    it('should seek input if startTime is provided for video', () => {
      const seekInputSpy = jest.spyOn(mockFfmpegCommand, 'seekInput');
      const startTime = 30;
      (service as any).startVideoConversion(
        mkvUrl,
        streamIndex,
        playlistPath,
        segmentPath,
        sessionId,
        startTime,
      );
      expect(seekInputSpy).toHaveBeenCalledWith(startTime);
    });

    it('should seek input if startTime is provided for audio', () => {
      const seekInputSpy = jest.spyOn(mockFfmpegCommand, 'seekInput');
      const startTime = 30;
      (service as any).startAudioConversion(
        mkvUrl,
        streamIndex,
        playlistPath,
        segmentPath,
        sessionId,
        audioIndex,
        startTime,
      );
      expect(seekInputSpy).toHaveBeenCalledWith(startTime);
    });
  });

  describe('waitForFile', () => {
    const filePath = '/tmp/test-file.m3u8';
    let setTimeoutSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.useFakeTimers();
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.statSync as jest.Mock).mockReturnValue({ size: 0 });
      setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
      setTimeoutSpy.mockRestore();
    });

    it('should resolve if file exists and has content within timeout', async () => {
      const promise = (service as any).waitForFile(filePath, 1000);

      // Simuler la création du fichier après un certain temps
      jest.advanceTimersByTime(500);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({ size: 100 });

      await expect(promise).resolves.toBeUndefined();
    });

    it('should reject if file does not exist within timeout', async () => {
      const promise = (service as any).waitForFile(filePath, 100);
      const advancePromise = jest.advanceTimersByTimeAsync(600); // Advance time concurrently
      await expect(promise).rejects.toThrow(
        `Timeout waiting for file: ${filePath}`,
      );
      await advancePromise;
    });

    it('should reject if file exists but is empty within timeout', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({ size: 0 });

      const promise = (service as any).waitForFile(filePath, 100);
      const advancePromise = jest.advanceTimersByTimeAsync(600); // Advance time concurrently

      await expect(promise).rejects.toThrow(
        `Timeout waiting for file: ${filePath}`,
      );
      await advancePromise;
    });

    it('should resolve immediately if file exists and has content', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({ size: 100 });

      const promise = (service as any).waitForFile(filePath, 1000);
      await expect(promise).resolves.toBeUndefined();
      expect(setTimeoutSpy).not.toHaveBeenCalled();
    });
  });
});
