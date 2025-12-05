import { validate } from 'class-validator';
import { StartStreamDto } from './start-stream.dto';

describe('StartStreamDto', () => {
  it('should validate a valid DTO with mkvUrl only', async () => {
    const dto = new StartStreamDto();
    dto.mkvUrl = 'https://example.com/video.mkv';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a valid DTO with mkvUrl and startTime', async () => {
    const dto = new StartStreamDto();
    dto.mkvUrl = 'https://example.com/video.mkv';
    dto.startTime = 120;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when mkvUrl is empty', async () => {
    const dto = new StartStreamDto();
    dto.mkvUrl = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('mkvUrl');
  });

  it('should fail validation when mkvUrl is not a valid URL', async () => {
    const dto = new StartStreamDto();
    dto.mkvUrl = 'not-a-valid-url';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('mkvUrl');
  });

  it('should fail validation when mkvUrl is missing', async () => {
    const dto = new StartStreamDto();

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('mkvUrl');
  });

  it('should fail validation when startTime is not a number', async () => {
    const dto = new StartStreamDto();
    dto.mkvUrl = 'https://example.com/video.mkv';
    (dto as any).startTime = 'not-a-number';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('startTime');
  });

  it('should validate when startTime is undefined (optional)', async () => {
    const dto = new StartStreamDto();
    dto.mkvUrl = 'https://example.com/video.mkv';
    dto.startTime = undefined;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate various valid URL formats', async () => {
    const validUrls = [
      'https://example.com/video.mkv',
      'http://example.com/video.mkv',
      'https://subdomain.example.com/path/to/video.mkv',
      'https://example.com:8080/video.mkv',
      'https://example.com/video.mkv?param=value',
    ];

    for (const url of validUrls) {
      const dto = new StartStreamDto();
      dto.mkvUrl = url;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    }
  });

  it('should validate various valid startTime values', async () => {
    const validStartTimes = [0, 1, 120, 3600, 7200];

    for (const startTime of validStartTimes) {
      const dto = new StartStreamDto();
      dto.mkvUrl = 'https://example.com/video.mkv';
      dto.startTime = startTime;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    }
  });
});
