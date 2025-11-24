import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewingHistory } from './entities/viewing-history.entity';
import { ViewingHistoryService } from './viewing-history.service';
import { ViewingHistoryController } from './viewing-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ViewingHistory])],
  providers: [ViewingHistoryService],
  controllers: [ViewingHistoryController],
  exports: [ViewingHistoryService],
})
export class ViewingHistoryModule {}
