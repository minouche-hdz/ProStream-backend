import { Module } from '@nestjs/common';
import { ProwlarrService } from './prowlarr.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ProwlarrController } from './prowlarr.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [ProwlarrService],
  exports: [ProwlarrService],
  controllers: [ProwlarrController],
})
export class ProwlarrModule {}
