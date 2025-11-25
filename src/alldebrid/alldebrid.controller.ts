import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AlldebridService } from './alldebrid.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import {
  AlldebridMagnetUploadResponse,
  AlldebridStreamingLinkResponse,
  AlldebridMagnetStatusResponse,
} from './interfaces/alldebrid.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AddMagnetDto } from './dto/add-magnet.dto';
import { GetStreamingLinkDto } from './dto/get-streaming-link.dto';

@ApiTags('alldebrid')
@UseGuards(JwtAuthGuard)
@Controller('alldebrid')
@ApiBearerAuth()
export class AlldebridController {
  constructor(private readonly alldebridService: AlldebridService) {}

  @Post('add-magnet')
  @ApiOperation({ summary: 'Ajouter un lien magnet à Alldebrid' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lien magnet ajouté avec succès',
    // type: AlldebridMagnetUploadResponse, // Supprimé car c'est une interface
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @ApiBody({ type: AddMagnetDto })
  async addMagnet(
    @Body() addMagnetDto: AddMagnetDto,
  ): Promise<AlldebridMagnetUploadResponse> {
    const magnetContent = await this.alldebridService.urlToMagnet(
      addMagnetDto.downloadUrl,
    );
    return this.alldebridService.addMagnet(magnetContent);
  }

  @Post('streaming-link')
  @ApiOperation({
    summary: 'Obtenir un lien de streaming direct depuis Alldebrid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lien de streaming généré',
    // type: AlldebridStreamingLinkResponse, // Supprimé car c'est une interface
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @ApiBody({ type: GetStreamingLinkDto })
  async getStreamingLink(
    @Body() getStreamingLinkDto: GetStreamingLinkDto,
  ): Promise<AlldebridStreamingLinkResponse> {
    return this.alldebridService.getStreamingLink(getStreamingLinkDto.link);
  }

  @Get('magnet-status')
  @ApiOperation({ summary: "Obtenir le statut d'un magnet Alldebrid" })
  @ApiQuery({
    name: 'magnetId',
    description: 'ID du magnet Alldebrid',
    type: String,
    example: '1234567890abcdef12345678',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statut du magnet',
    // type: AlldebridMagnetStatusResponse, // Supprimé car c'est une interface
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getMagnetStatus(
    @Query('magnetId') magnetId: string,
  ): Promise<AlldebridMagnetStatusResponse> {
    return this.alldebridService.getMagnetStatus(magnetId);
  }

  @Post('streaming-link-magnet')
  @ApiOperation({
    summary: "Obtenir un lien de streaming à partir d'un lien magnet",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lien de streaming généré à partir du magnet',
    // type: AlldebridStreamingLinkResponse, // Supprimé car c'est une interface
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @ApiBody({ type: AddMagnetDto })
  async getStreamFromMagnet(
    @Body() addMagnetDto: AddMagnetDto,
  ): Promise<AlldebridStreamingLinkResponse> {
    const magnetContent = await this.alldebridService.urlToMagnet(
      addMagnetDto.downloadUrl,
    );
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
