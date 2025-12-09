import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger'; // Importez ces modules

// Mock NestFactory et SwaggerModule pour éviter le démarrage réel de l'application et la génération de la documentation
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      listen: jest.fn(() => Promise.resolve(undefined)),
      close: jest.fn(() => Promise.resolve(undefined)),
      enableCors: jest.fn().mockReturnThis(),
      getHttpAdapter: jest.fn().mockReturnValue({
        getType: jest.fn().mockReturnValue('express'),
      }),
      useGlobalPipes: jest.fn().mockReturnThis(), // Ajout du mock pour useGlobalPipes
      useGlobalFilters: jest.fn().mockReturnThis(), // Ajout du mock pour useGlobalFilters
      get: jest.fn((token) => {
        if (token.name === 'ConfigService') {
          return {
            get: jest.fn((key, defaultValue) => {
              if (key === 'CLIENT_URL') return 'http://localhost:3000';
              return defaultValue;
            }),
          };
        }
        return undefined;
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
    await import('./main'); // Importation du fichier TypeScript original
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
    expect(app.listen).toHaveBeenCalledWith(
      process.env.PORT ?? 3000,
      '0.0.0.0',
    );
  });
});
