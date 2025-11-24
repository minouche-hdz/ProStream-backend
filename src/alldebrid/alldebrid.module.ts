import { Module } from '@nestjs/common';
import { AlldebridService } from './alldebrid.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AlldebridController } from './alldebrid.controller';
import { ProwlarrModule } from '../prowlarr/prowlarr.module'; // Import ProwlarrModule

@Module({
  imports: [HttpModule, ConfigModule, ProwlarrModule], // Add ProwlarrModule here
  providers: [AlldebridService],
  exports: [AlldebridService],
  controllers: [AlldebridController],
})
export class AlldebridModule {}
