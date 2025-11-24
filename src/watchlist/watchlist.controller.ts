import { Controller, Post, Delete, Get, Body, Param, UseGuards } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/entities/user/user';

@Controller('watchlist')
@UseGuards(JwtAuthGuard)
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Post()
  async addToWatchlist(
    @GetUser() user: User,
    @Body('tmdbId') tmdbId: number,
    @Body('mediaType') mediaType: string,
    @Body('title') title: string,
    @Body('posterPath') posterPath: string,
  ) {
    return this.watchlistService.addToWatchlist(user.id, tmdbId, mediaType, title, posterPath);
  }

  @Delete(':tmdbId/:mediaType')
  async removeFromWatchlist(
    @GetUser() user: User,
    @Param('tmdbId') tmdbId: number,
    @Param('mediaType') mediaType: string,
  ) {
    await this.watchlistService.removeFromWatchlist(user.id, tmdbId, mediaType);
    return { message: 'Item removed from watchlist' };
  }

  @Get()
  async getWatchlist(@GetUser() user: User) {
    return this.watchlistService.getWatchlist(user.id);
  }
}
