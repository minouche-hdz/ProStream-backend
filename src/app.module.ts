import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { ProwlarrModule } from './prowlarr/prowlarr.module';
import { AlldebridModule } from './alldebrid/alldebrid.module';
import { StreamingModule } from './streaming/streaming.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@src/users/entities/user/user'; // Importez l'entité User
import { WatchlistModule } from '@src/watchlist/watchlist.module';
import { Watchlist } from '@src/watchlist/entities/watchlist.entity';
import { ViewingHistoryModule } from '@src/viewing-history/viewing-history.module';
import { ViewingHistory } from '@src/viewing-history/entities/viewing-history.entity';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST as string,
      port: parseInt(process.env.DB_PORT as string, 10) || 5432,
      username: process.env.DB_USERNAME as string,
      password: process.env.DB_PASSWORD as string,
      database: process.env.DB_DATABASE as string,
      entities: [User, Watchlist, ViewingHistory], // Ajoutez vos entités ici
      synchronize: true, // À utiliser avec prudence en production
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
  providers: [AppService],
})
export class AppModule {}
