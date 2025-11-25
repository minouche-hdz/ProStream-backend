import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger'; // Importez ces modules

// Mock NestFactory et SwaggerModule pour éviter le démarrage réel de l'application et la génération de la documentation
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      listen: jest.fn(() => Promise.resolve(undefined)),
      close: jest.fn(() => Promise.resolve(undefined)),
      getHttpAdapter: jest.fn().mockReturnValue({
        getType: jest.fn().mockReturnValue('express'), // Ou 'fastify' si vous l'utilisez
      }),
    }),
  },
}));

jest.mock('@nestjs/swagger', () => ({
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue({}),
    setup: jest.fn(),
  },
  DocumentBuilder: jest.fn().mockImplementation(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addBearerAuth: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnThis(),
  })),
  ApiProperty: () => jest.fn(), // Mock ApiProperty
  ApiTags: () => jest.fn(), // Mock ApiTags
  ApiOperation: () => jest.fn(), // Mock ApiOperation
  ApiResponse: () => jest.fn(), // Mock ApiResponse
  ApiBearerAuth: () => jest.fn(), // Mock ApiBearerAuth
  ApiBody: () => jest.fn(), // Mock ApiBody
  ApiParam: () => jest.fn(), // Mock ApiParam
  ApiQuery: () => jest.fn(), // Mock ApiQuery
}));

describe('main.ts', () => {
  it('should call NestFactory.create, configure Swagger, and app.listen', async () => {
    // Import main.ts to trigger bootstrap()
    await import('./main'); // Suppression de l'extension .js
    const app = await NestFactory.create(AppModule);

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(
      app,
      expect.any(Object),
    );
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api',
      app,
      expect.any(Object),
    );
    expect(app.listen).toHaveBeenCalledWith(process.env.PORT ?? 3000);
  });
});
