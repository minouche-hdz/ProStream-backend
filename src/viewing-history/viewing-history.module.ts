import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewingHistory } from '@src/viewing-history/entities/viewing-history.entity';
import { ViewingHistoryService } from '@src/viewing-history/viewing-history.service';
import { ViewingHistoryController } from '@src/viewing-history/viewing-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ViewingHistory])],
  providers: [ViewingHistoryService],
  controllers: [ViewingHistoryController],
  exports: [ViewingHistoryService],
})
export class ViewingHistoryModule {}
