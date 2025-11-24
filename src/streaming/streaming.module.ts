import { Module } from '@nestjs/common';
import { StreamingService } from './streaming.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { StreamingController } from './streaming.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [StreamingService],
  exports: [StreamingService],
  controllers: [StreamingController],
})
export class StreamingModule {}
