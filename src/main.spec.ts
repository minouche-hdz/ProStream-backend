import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Mock NestFactory to prevent actual application startup
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      listen: jest.fn(() => Promise.resolve(undefined)),
      close: jest.fn(() => Promise.resolve(undefined)),
    }),
  },
}));

describe('main.ts', () => {
  it('should call NestFactory.create and app.listen', async () => {
    // Import main.ts to trigger bootstrap()
    await import('./main');
    const app = await NestFactory.create(AppModule);

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(app.listen).toHaveBeenCalledWith(process.env.PORT ?? 3000);
  });
});
