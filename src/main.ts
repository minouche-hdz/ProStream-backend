import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CustomLogger } from './common/logger/custom-logger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });

  const configService = app.get(ConfigService);
  const clientUrl = configService.get('CLIENT_URL');

  app.enableCors({
    origin: clientUrl || 'http://localhost:3000', // À ajuster pour la production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés qui ne sont pas définies dans les DTOs
      forbidNonWhitelisted: true, // Lance une erreur si des propriétés non définies sont envoyées
      transform: true, // Transforme les payloads en instances de DTO
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('ProStream Backend API')
    .setDescription("Documentation de l'API ProStream Backend")
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
void bootstrap();
