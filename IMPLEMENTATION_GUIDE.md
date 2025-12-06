# 🚀 Guide d'Implémentation des Recommandations

**Date :** 2025-12-06  
**Version :** 1.0

Ce guide vous permet d'implémenter toutes les recommandations prioritaires étape par étape.

---

## ✅ Dépendances Installées

Les packages suivants ont été installés :

```bash
✅ @nestjs/throttler          # Rate limiting
✅ @nestjs/cache-manager       # Cache management
✅ cache-manager               # Cache storage
✅ nest-winston                # Winston logging
✅ winston                     # Logger
✅ @nestjs/schedule            # Cron jobs
```

---

## 📋 Implémentations à Faire

### 1. Rate Limiting (Sécurité) 🔴 PRIORITÉ HAUTE

#### Étape 1.1 : Modifier `src/app.module.ts`

Ajoutez l'import et la configuration :

```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // ... vos imports existants

    // Rate limiting global
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 60 secondes
      limit: 10,   // 10 requêtes max par minute
    }]),
  ],
  providers: [
    // ... vos providers existants

    // Activer le rate limiting globalement
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

#### Étape 1.2 : Personnaliser par endpoint (optionnel)

Pour des endpoints spécifiques, utilisez le décorateur `@Throttle()` :

```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('streaming')
export class StreamingController {
  // Limite plus stricte pour le streaming
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('start-hls')
  async startHlsStream(@Body() dto: StartStreamDto) {
    // ...
  }

  // Pas de limite pour certains endpoints
  @SkipThrottle()
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
```

---

### 2. Cache Manager (Performance) 🔴 PRIORITÉ HAUTE

#### Étape 2.1 : Modifier `src/app.module.ts`

```typescript
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    // ... vos imports existants

    // Cache global (en mémoire)
    CacheModule.register({
      isGlobal: true,
      ttl: 3600, // 1 heure par défaut
      max: 100,  // 100 items max
    }),
  ],
})
export class AppModule {}
```

#### Étape 2.2 : Utiliser le cache dans `src/tmdb/tmdb.service.ts`

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class TmdbService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    // ... vos autres dépendances
  ) {}

  async getMovie(id: string) {
    const cacheKey = `tmdb:movie:${id}`;
    
    // Vérifier le cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Appel API TMDB
    const movie = await this.fetchMovieFromTmdb(id);

    // Mettre en cache pour 1 heure
    await this.cacheManager.set(cacheKey, movie, 3600000);

    return movie;
  }

  async searchMovies(query: string) {
    const cacheKey = `tmdb:search:${query}`;
    
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const results = await this.searchTmdb(query);
    
    // Cache pour 30 minutes (les résultats de recherche changent moins souvent)
    await this.cacheManager.set(cacheKey, results, 1800000);

    return results;
  }
}
```

#### Étape 2.3 : Utiliser le cache dans `src/prowlarr/prowlarr.service.ts`

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProwlarrService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    // ... vos autres dépendances
  ) {}

  async search(query: string) {
    const cacheKey = `prowlarr:search:${query}`;
    
    // Cache court pour les torrents (5 minutes)
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const results = await this.searchProwlarr(query);
    
    // Cache pour 5 minutes
    await this.cacheManager.set(cacheKey, results, 300000);

    return results;
  }
}
```

---

### 3. Logging avec Winston (Monitoring) 🟡 PRIORITÉ MOYENNE

#### Étape 3.1 : Modifier `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        // Console (développement)
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `${timestamp} [${context}] ${level}: ${message}`;
            }),
          ),
        }),
        // Fichier pour les erreurs
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        // Fichier pour tous les logs
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  });

  // ... reste de votre configuration
  await app.listen(3000);
}
bootstrap();
```

#### Étape 3.2 : Créer le dossier logs

```bash
mkdir -p logs
```

#### Étape 3.3 : Ajouter logs/ au .gitignore

```gitignore
# Logs
logs/
*.log
```

#### Étape 3.4 : Utiliser le logger dans vos services

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class StreamingService {
  private readonly logger = new Logger(StreamingService.name);

  async startHlsStream(url: string) {
    this.logger.log(`Démarrage du streaming HLS pour : ${url}`);
    
    try {
      // ... votre logique
      this.logger.log(`Streaming démarré avec succès`);
    } catch (error) {
      this.logger.error(`Erreur lors du streaming : ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

---

### 4. Cleanup Service HLS (Performance) 🔴 PRIORITÉ HAUTE

#### Étape 4.1 : Créer `src/cleanup/cleanup.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);
  private readonly hlsTempDir = path.join(process.cwd(), 'hls_temp');
  private readonly maxAge = 24 * 60 * 60 * 1000; // 24 heures

  @Cron(CronExpression.EVERY_6_HOURS)
  async cleanOldHlsFiles(): Promise<void> {
    this.logger.log('Démarrage du nettoyage des fichiers HLS...');

    try {
      await fs.access(this.hlsTempDir);
    } catch {
      this.logger.warn(`Le dossier ${this.hlsTempDir} n'existe pas`);
      return;
    }

    const now = Date.now();
    let deletedCount = 0;

    const entries = await fs.readdir(this.hlsTempDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(this.hlsTempDir, entry.name);
      
      if (entry.isDirectory()) {
        await this.cleanDirectory(entryPath, now);
      } else {
        const deleted = await this.deleteIfOld(entryPath, now);
        if (deleted) deletedCount++;
      }
    }

    this.logger.log(`Nettoyage terminé : ${deletedCount} fichier(s) supprimé(s)`);
  }

  private async cleanDirectory(dirPath: string, now: number): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        await this.cleanDirectory(entryPath, now);
      } else {
        await this.deleteIfOld(entryPath, now);
      }
    }

    // Supprimer le dossier s'il est vide
    const remaining = await fs.readdir(dirPath);
    if (remaining.length === 0) {
      await fs.rmdir(dirPath);
    }
  }

  private async deleteIfOld(filePath: string, now: number): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      const age = now - stats.mtimeMs;

      if (age > this.maxAge) {
        await fs.unlink(filePath);
        this.logger.debug(`Fichier supprimé : ${filePath}`);
        return true;
      }
    } catch (error) {
      this.logger.error(`Erreur : ${error.message}`);
    }
    return false;
  }
}
```

#### Étape 4.2 : Créer `src/cleanup/cleanup.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';

@Module({
  providers: [CleanupService],
  exports: [CleanupService],
})
export class CleanupModule {}
```

#### Étape 4.3 : Modifier `src/app.module.ts`

```typescript
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupModule } from './cleanup/cleanup.module';

@Module({
  imports: [
    // ... vos imports existants

    // Activer le scheduler
    ScheduleModule.forRoot(),

    // Importer le module de cleanup
    CleanupModule,
  ],
})
export class AppModule {}
```

---

### 5. Validation des Chemins de Fichiers (Sécurité) 🔴 PRIORITÉ HAUTE

#### Étape 5.1 : Créer `src/common/validators/file-path.validator.ts`

```typescript
import { BadRequestException } from '@nestjs/common';
import * as path from 'path';

export class FilePathValidator {
  /**
   * Valide et sécurise un chemin de fichier
   * Empêche les attaques de type path traversal (../)
   */
  static validateFilePath(filePath: string, allowedDir?: string): string {
    if (!filePath) {
      throw new BadRequestException('Le chemin du fichier est requis');
    }

    // Normaliser le chemin
    const normalized = path.normalize(filePath);

    // Vérifier les tentatives de path traversal
    if (normalized.includes('..') || normalized.startsWith('/')) {
      throw new BadRequestException('Chemin de fichier invalide');
    }

    // Si un dossier autorisé est spécifié, vérifier que le fichier est dedans
    if (allowedDir) {
      const fullPath = path.join(allowedDir, normalized);
      const resolvedPath = path.resolve(fullPath);
      const resolvedAllowedDir = path.resolve(allowedDir);

      if (!resolvedPath.startsWith(resolvedAllowedDir)) {
        throw new BadRequestException('Accès au fichier non autorisé');
      }

      return resolvedPath;
    }

    return normalized;
  }

  /**
   * Valide une extension de fichier
   */
  static validateFileExtension(
    filePath: string,
    allowedExtensions: string[],
  ): void {
    const ext = path.extname(filePath).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestException(
        `Extension de fichier non autorisée. Extensions autorisées : ${allowedExtensions.join(', ')}`,
      );
    }
  }
}
```

#### Étape 5.2 : Utiliser dans `src/streaming/streaming.controller.ts`

```typescript
import { FilePathValidator } from '../common/validators/file-path.validator';

@Controller('streaming')
export class StreamingController {
  @Get(':filePath')
  async streamFile(@Param('filePath') filePath: string) {
    // Valider le chemin
    const safePath = FilePathValidator.validateFilePath(
      filePath,
      path.join(process.cwd(), 'hls_temp'),
    );

    // Valider l'extension
    FilePathValidator.validateFileExtension(safePath, [
      '.m3u8',
      '.ts',
      '.m4s',
      '.mp4',
      '.mkv',
    ]);

    // Continuer avec le streaming sécurisé
    return this.streamingService.streamFile(safePath);
  }
}
```

---

### 6. Améliorer la Documentation Swagger 🟡 PRIORITÉ MOYENNE

#### Étape 6.1 : Modifier `src/main.ts`

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration Swagger améliorée
  const config = new DocumentBuilder()
    .setTitle('ProStream API')
    .setDescription('API pour le streaming de contenu multimédia')
    .setVersion('2.0.0')
    .addTag('auth', 'Authentification et gestion des utilisateurs')
    .addTag('tmdb', 'The Movie Database - Catalogue de films et séries')
    .addTag('prowlarr', 'Recherche de torrents')
    .addTag('alldebrid', 'Gestion des téléchargements')
    .addTag('streaming', 'Streaming HLS')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(3000);
}
```

#### Étape 6.2 : Documenter les DTOs

Exemple pour `src/streaming/dto/start-stream.dto.ts` :

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsOptional } from 'class-validator';

export class StartStreamDto {
  @ApiProperty({
    description: 'URL du fichier à streamer',
    example: 'https://example.com/video.mp4',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'Qualité de sortie',
    example: '720p',
    required: false,
  })
  @IsOptional()
  @IsString()
  quality?: string;
}
```

#### Étape 6.3 : Documenter les endpoints

```typescript
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('streaming')
@Controller('streaming')
export class StreamingController {
  @Post('start-hls')
  @ApiOperation({ summary: 'Démarrer un stream HLS' })
  @ApiResponse({
    status: 200,
    description: 'Stream démarré avec succès',
    schema: {
      example: {
        sessionId: 'abc123',
        masterPlaylistUrl: 'http://localhost:3000/hls/abc123/master.m3u8',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'URL invalide' })
  @ApiResponse({ status: 429, description: 'Trop de requêtes' })
  async startHlsStream(@Body() dto: StartStreamDto) {
    // ...
  }
}
```

---

## 🔧 Modifications du Dockerfile

Ajoutez la création du dossier logs :

```dockerfile
# Dans le stage production, après la création de hls_temp
RUN mkdir -p /app/hls_temp /app/logs && \
    chown -R nestjs:nodejs /app
```

---

## 📝 Checklist d'Implémentation

### Sécurité
- [ ] Rate limiting configuré dans app.module.ts
- [ ] Validation des chemins de fichiers implémentée
- [ ] FilePathValidator créé et utilisé
- [ ] Throttle personnalisé sur les endpoints sensibles

### Performance
- [ ] Cache Manager configuré dans app.module.ts
- [ ] Cache utilisé dans TmdbService
- [ ] Cache utilisé dans ProwlarrService
- [ ] CleanupService créé
- [ ] CleanupModule créé et importé
- [ ] ScheduleModule activé

### Monitoring
- [ ] Winston configuré dans main.ts
- [ ] Dossier logs/ créé
- [ ] logs/ ajouté au .gitignore
- [ ] Logger utilisé dans les services

### Documentation
- [ ] Swagger amélioré dans main.ts
- [ ] DTOs documentés avec @ApiProperty
- [ ] Endpoints documentés avec @ApiOperation
- [ ] Tags Swagger ajoutés

---

## 🧪 Tests

### Tester le Rate Limiting

```bash
# Faire plus de 10 requêtes en 1 minute
for i in {1..15}; do curl http://localhost:3000/tmdb/popular/movie; done

# Devrait retourner 429 après la 10ème requête
```

### Tester le Cache

```bash
# Première requête (lente, appel API)
time curl http://localhost:3000/tmdb/movie/550

# Deuxième requête (rapide, depuis le cache)
time curl http://localhost:3000/tmdb/movie/550
```

### Tester le Cleanup

```bash
# Créer des fichiers de test
mkdir -p hls_temp/test
touch hls_temp/test/old_file.m3u8

# Modifier la date du fichier (24h+ dans le passé)
touch -t 202512050000 hls_temp/test/old_file.m3u8

# Attendre le cron (ou déclencher manuellement)
# Le fichier devrait être supprimé
```

### Tester les Logs

```bash
# Vérifier que les logs sont créés
ls -la logs/

# Voir les logs en temps réel
tail -f logs/combined.log
```

---

## 🚀 Déploiement

Après implémentation, rebuilder l'image Docker :

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📊 Résultats Attendus

Après implémentation complète :

✅ **Sécurité** : Rate limiting actif, validation des chemins  
✅ **Performance** : Cache actif, cleanup automatique  
✅ **Monitoring** : Logs structurés dans fichiers  
✅ **Documentation** : Swagger complet et détaillé  

---

**Bon développement ! 💪**
