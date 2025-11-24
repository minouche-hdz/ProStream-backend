import { Test, TestingModule } from '@nestjs/testing';
import { StreamingController } from './streaming.controller';
import { StreamingService } from './streaming.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import { Response } from 'express';

describe('StreamingController', () => {
  let controller: StreamingController;
  // let service: StreamingService; // Removed as it's not used

  const mockStreamingService = {
    streamFile: jest.fn(),
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
    })
      .overrideGuard(JwtAuthGuard) // Bypass JwtAuthGuard for controller tests
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<StreamingController>(StreamingController);
    // service = module.get<StreamingService>(StreamingService); // Removed as it's not used

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('streamFile', () => {
    it('should call streamingService.streamFile with correct parameters', () => {
      const filePath = 'test/path/to/file.mp4';
      const mockResponse = {} as Response; // Mock Response object

      controller.streamFile(filePath, mockResponse);

      expect(mockStreamingService.streamFile).toHaveBeenCalledWith(
        filePath,
        mockResponse,
      );
    });
  });
});
