import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Watchlist } from '@src/watchlist/entities/watchlist.entity';
import { WatchlistService } from '@src/watchlist/watchlist.service';
import { WatchlistController } from '@src/watchlist/watchlist.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Watchlist])],
  providers: [WatchlistService],
  controllers: [WatchlistController],
  exports: [WatchlistService],
})
export class WatchlistModule {}
