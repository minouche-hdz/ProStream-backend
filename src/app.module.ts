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
import { User } from './users/entities/user/user'; // Importez l'entité User
import { WatchlistModule } from './watchlist/watchlist.module';
import { Watchlist } from './watchlist/entities/watchlist.entity';
import { ViewingHistoryModule } from './viewing-history/viewing-history.module';
import { ViewingHistory } from './viewing-history/entities/viewing-history.entity';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
