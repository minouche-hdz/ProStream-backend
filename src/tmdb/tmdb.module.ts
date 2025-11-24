import { Module } from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TmdbController } from './tmdb.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [TmdbService],
  exports: [TmdbService],
  controllers: [TmdbController],
})
export class TmdbModule {}
