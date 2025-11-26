import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AlldebridService } from './alldebrid.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import {
<<<<<<< Updated upstream
  AlldebridMagnetUploadResponse,
  AlldebridStreamingLinkResponse,
  AlldebridMagnetStatusResponse,
} from './interfaces/alldebrid.interface';
=======
  AlldebridMagnetUploadResponseDto,
  AlldebridStreamingLinkResponseDto,
  AlldebridMagnetStatusResponseDto,
} from './dto/alldebrid-responses.dto';
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
>>>>>>> Stashed changes

@UseGuards(JwtAuthGuard)
@Controller('alldebrid')
export class AlldebridController {
  constructor(private readonly alldebridService: AlldebridService) {}

  @Post('add-magnet')
<<<<<<< Updated upstream
  async addMagnet(
    @Body('downloadUrl') downloadUrl: string,
  ): Promise<AlldebridMagnetUploadResponse> {
    const magnetContent = await this.alldebridService.urlToMagnet(downloadUrl);
=======
  @ApiOperation({ summary: 'Ajouter un lien magnet à Alldebrid' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lien magnet ajouté avec succès',
    type: AlldebridMagnetUploadResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @ApiBody({ type: AddMagnetDto })
  async addMagnet(
    @Body() addMagnetDto: AddMagnetDto,
  ): Promise<AlldebridMagnetUploadResponseDto> {
    const magnetContent = await this.alldebridService.urlToMagnet(
      addMagnetDto.downloadUrl,
    );
>>>>>>> Stashed changes
    return this.alldebridService.addMagnet(magnetContent);
  }

  @Post('streaming-link')
<<<<<<< Updated upstream
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
=======
  @ApiOperation({
    summary: 'Obtenir un lien de streaming direct depuis Alldebrid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lien de streaming généré',
    type: AlldebridStreamingLinkResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @ApiBody({ type: GetStreamingLinkDto })
  async getStreamingLink(
    @Body() getStreamingLinkDto: GetStreamingLinkDto,
  ): Promise<AlldebridStreamingLinkResponseDto> {
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
    type: AlldebridMagnetStatusResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getMagnetStatus(
    @Query('magnetId') magnetId: string,
  ): Promise<AlldebridMagnetStatusResponseDto> {
>>>>>>> Stashed changes
    return this.alldebridService.getMagnetStatus(magnetId);
  }

  @Post('streaming-link-magnet')
<<<<<<< Updated upstream
  async getStreamFromMagnet(
    @Body('downloadUrl') downloadUrl: string,
  ): Promise<AlldebridStreamingLinkResponse> {
    const magnetContent = await this.alldebridService.urlToMagnet(downloadUrl);
=======
  @ApiOperation({
    summary: "Obtenir un lien de streaming à partir d'un lien magnet",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lien de streaming généré à partir du magnet',
    type: AlldebridStreamingLinkResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @ApiBody({ type: AddMagnetDto })
  async getStreamFromMagnet(
    @Body() addMagnetDto: AddMagnetDto,
  ): Promise<AlldebridStreamingLinkResponseDto> {
    const magnetContent = await this.alldebridService.urlToMagnet(
      addMagnetDto.downloadUrl,
    );
>>>>>>> Stashed changes
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
