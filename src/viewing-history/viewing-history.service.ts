import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViewingHistory } from './entities/viewing-history.entity';
@Injectable()
export class ViewingHistoryService {
  constructor(
    @InjectRepository(ViewingHistory)
    private viewingHistoryRepository: Repository<ViewingHistory>,
  ) {}

  async updateViewingHistory(
    userId: string,
    tmdbId: number,
    mediaType: string,
    title: string,
    posterPath: string,
    progress: number,
  ): Promise<ViewingHistory> {
    let historyItem = await this.viewingHistoryRepository.findOne({
      where: { userId, tmdbId, mediaType },
    });

    if (historyItem) {
      historyItem.progress = progress;
      historyItem.lastWatched = new Date();
    } else {
      historyItem = this.viewingHistoryRepository.create({
        userId,
        tmdbId,
        mediaType,
        title,
        posterPath,
        progress,
        lastWatched: new Date(),
      });
    }
    return this.viewingHistoryRepository.save(historyItem);
  }

  async getViewingHistory(userId: string): Promise<ViewingHistory[]> {
    return this.viewingHistoryRepository.find({ where: { userId } });
  }

  async removeViewingHistoryItem(
    userId: string,
    tmdbId: number,
    mediaType: string,
  ): Promise<void> {
    await this.viewingHistoryRepository.delete({ userId, tmdbId, mediaType });
  }
}
