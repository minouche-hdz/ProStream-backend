import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AlldebridService } from './alldebrid.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import {
  AlldebridMagnetUploadResponse,
  AlldebridStreamingLinkResponse,
  AlldebridMagnetStatusResponse,
} from './interfaces/alldebrid.interface';

@UseGuards(JwtAuthGuard)
@Controller('alldebrid')
export class AlldebridController {
  constructor(private readonly alldebridService: AlldebridService) {}

  @Post('add-magnet')
  async addMagnet(
    @Body('downloadUrl') downloadUrl: string,
  ): Promise<AlldebridMagnetUploadResponse> {
    const magnetContent = await this.alldebridService.urlToMagnet(downloadUrl);
    return this.alldebridService.addMagnet(magnetContent);
  }

  @Post('streaming-link')
  async getStreamingLink(
    @Body('link') link: string,
  ): Promise<AlldebridStreamingLinkResponse> {
    return this.alldebridService.getStreamingLink(link);
  }

  @Get('magnet-status')
  async getMagnetStatus(
    @Body('magnetId') magnetId: string,
  ): Promise<AlldebridMagnetStatusResponse> {
    await this.alldebridService.getMagnetStatus(magnetId);
    return this.alldebridService.getMagnetStatus(magnetId);
  }

  @Post('streaming-link-magnet')
  async getStreamFromMagnet(
    @Body('downloadUrl') downloadUrl: string,
  ): Promise<AlldebridStreamingLinkResponse> {
    const magnetContent = await this.alldebridService.urlToMagnet(downloadUrl);
    const magnetResponse = await this.alldebridService.addMagnet(magnetContent);
    const magnetId = magnetResponse.data.magnets[0].id;
    const statusResponse =
      await this.alldebridService.getMagnetStatus(magnetId);

    if (
      !statusResponse.data.magnets ||
      !statusResponse.data.magnets[magnetId]
    ) {
      throw new Error('Magnet status data is invalid or magnet not found.');
    }

    const magnetStatus = statusResponse.data.magnets[magnetId];
    if (!magnetStatus.files || magnetStatus.files.length === 0) {
      throw new Error('No files found for the magnet.');
    }

    const link = magnetStatus.files[0].l;
    const streamingLink = await this.alldebridService.getStreamingLink(link);
    return streamingLink;
  }
}
