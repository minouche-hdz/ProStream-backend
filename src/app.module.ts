import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { ProwlarrModule } from './prowlarr/prowlarr.module';
import { AlldebridModule } from './alldebrid/alldebrid.module';
import { StreamingModule } from './streaming/streaming.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@src/users/entities/user/user';
import { WatchlistModule } from '@src/watchlist/watchlist.module';
import { Watchlist } from '@src/watchlist/entities/watchlist.entity';
import { ViewingHistoryModule } from '@src/viewing-history/viewing-history.module';
import { ViewingHistory } from '@src/viewing-history/entities/viewing-history.entity';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import * as redisStore from 'cache-manager-redis-store';
import { HttpModule, HttpService } from '@nestjs/axios';
import { setupAxiosRetryInterceptor } from './common/interceptors/axios-retry.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    // Cache Redis (Global)
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST') || 'localhost',
        port: parseInt(configService.get('REDIS_PORT') || '6379', 10),
        ttl: 600,
      }),
      inject: [ConfigService],
    }),
    // Rate Limiting (Global)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('THROTTLE_TTL', 60000),
          limit: configService.get('THROTTLE_LIMIT', 100),
        },
      ],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST as string,
      port: parseInt(process.env.DB_PORT as string, 10) || 5432,
      username: process.env.DB_USERNAME as string,
      password: process.env.DB_PASSWORD as string,
      database: process.env.DB_DATABASE as string,
      entities: [User, Watchlist, ViewingHistory],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    TmdbModule,
    ProwlarrModule,
    AlldebridModule,
    StreamingModule,
    WatchlistModule,
    ViewingHistoryModule,
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_INTERCEPTOR',
      useFactory: (httpService: HttpService) => {
        setupAxiosRetryInterceptor(httpService);
        return {};
      },
      inject: [HttpService],
    },
  ],
})
export class AppModule {}
