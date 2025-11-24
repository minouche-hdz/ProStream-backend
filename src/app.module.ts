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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    TmdbModule,
    ProwlarrModule,
    AlldebridModule,
    StreamingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
