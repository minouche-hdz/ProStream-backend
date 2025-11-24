import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProwlarrService } from './prowlarr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('prowlarr')
export class ProwlarrController {
  constructor(private readonly prowlarrService: ProwlarrService) {}

  @Get('search')
  async search(@Query('query') query: string) {
    return this.prowlarrService.search(query);
  }

  @Get('indexers')
  async getIndexers() {
    return this.prowlarrService.getIndexers();
  }
}
