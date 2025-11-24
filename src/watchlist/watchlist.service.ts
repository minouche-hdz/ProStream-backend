import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watchlist } from './entities/watchlist.entity';
import { User } from '../users/entities/user/user';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(Watchlist)
    private watchlistRepository: Repository<Watchlist>,
  ) {}

  async addToWatchlist(userId: string, tmdbId: number, mediaType: string, title: string, posterPath: string): Promise<Watchlist> {
    const existingItem = await this.watchlistRepository.findOne({
      where: { userId, tmdbId, mediaType },
    });

    if (existingItem) {
      return existingItem; // Already in watchlist
    }

    const newItem = this.watchlistRepository.create({
      userId,
      tmdbId,
      mediaType,
      title,
      posterPath,
    });
    return this.watchlistRepository.save(newItem);
  }

  async removeFromWatchlist(userId: string, tmdbId: number, mediaType: string): Promise<void> {
    await this.watchlistRepository.delete({ userId, tmdbId, mediaType });
  }

  async getWatchlist(userId: string): Promise<Watchlist[]> {
    return this.watchlistRepository.find({ where: { userId } });
  }
}
