import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
  NotFoundException,
  Logger,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { StreamingService } from './streaming.service';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { StartStreamDto } from './dto/start-stream.dto';

@ApiTags('streaming')
@Controller('streaming')
export class StreamingController {
  private readonly logger = new Logger(StreamingController.name);
  private readonly HLS_TEMP_DIR = '/app/hls_temp'; // Doit correspondre à celui du service

  constructor(private readonly streamingService: StreamingService) {}

  @Post('start')
  @ApiOperation({ summary: 'Démarrer la conversion HLS pour un stream MKV' })
  @ApiBody({
    type: StartStreamDto,
    description: 'URL du stream MKV à convertir en HLS',
    examples: {
      example1: {
        summary: 'Démarrage standard',
        value: {
          mkvUrl: 'https://alldebrid.com/movie.mkv',
        },
      },
      exampleWithTime: {
        summary: 'Démarrage avec un temps de départ (2 minutes)',
        value: {
          mkvUrl: 'https://alldebrid.com/movie.mkv',
          startTime: 120,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Retourne l'URL du master playlist HLS et l'ID de session",
    schema: {
      properties: {
        sessionId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        masterPlaylistUrl: {
          type: 'string',
          example:
            '/streaming/session/550e8400-e29b-41d4-a716-446655440000/master.m3u8',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'URL invalide',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erreur lors du démarrage de la conversion HLS',
  })
  async startHls(@Body() startStreamDto: StartStreamDto) {
    try {
      const sessionId = await this.streamingService.startHlsStream(
        startStreamDto.mkvUrl,
        startStreamDto.startTime,
      );
      const masterPlaylistUrl = `/streaming/session/${sessionId}/master.m3u8`;
      this.logger.log(
        `HLS stream démarré pour la session ${sessionId}. Master playlist: ${masterPlaylistUrl}`,
      );
      return { sessionId, masterPlaylistUrl };
    } catch (error) {
      this.logger.error(
        `Erreur lors du démarrage du stream HLS: ${error.message}`,
      );
      throw new Error('Erreur lors du démarrage du stream HLS.');
    }
  }

  @Delete('stop/:sessionId')
  @ApiOperation({ summary: 'Arrêter un stream HLS et nettoyer les fichiers' })
  @ApiParam({
    name: 'sessionId',
    description: 'ID de la session de streaming HLS à arrêter',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stream arrêté avec succès',
  })
  stopStream(@Param('sessionId') sessionId: string) {
    this.streamingService.stopHlsStream(sessionId);
    return { message: 'Stream arrêté avec succès' };
  }

  @Get('session/:sessionId/*path')
  @ApiOperation({
    summary:
      'Servir les fichiers HLS pour une session donnée (avec sous-dossiers)',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'ID de la session de streaming HLS',
    type: String,
  })
  @ApiParam({
    name: 'path',
    description: 'Chemin du fichier HLS (peut inclure des sous-dossiers)',
    type: String,
    required: false,
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Fichier HLS servi' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fichier HLS non trouvé',
  })
  serveHlsFile(
    @Param('sessionId') sessionId: string,
    @Param('path') filePath: string | string[],
    @Res() res: Response,
  ) {
    // Le wildcard path peut être un tableau, on le convertit en string
    const pathString = Array.isArray(filePath)
      ? filePath.join('/')
      : filePath || '';

    // Construire le chemin complet du fichier
    const fullPath = path.join(this.HLS_TEMP_DIR, sessionId, pathString);

    // Vérifier que le fichier existe
    if (!fs.existsSync(fullPath)) {
      this.logger.warn(`Fichier HLS non trouvé: ${fullPath}`);
      throw new NotFoundException('Fichier HLS non trouvé.');
    }

    // Vérifier que le chemin ne sort pas du répertoire de session (sécurité)
    const normalizedPath = path.normalize(fullPath);
    const sessionDir = path.join(this.HLS_TEMP_DIR, sessionId);
    if (!normalizedPath.startsWith(sessionDir)) {
      this.logger.warn(`Tentative d'accès non autorisé: ${fullPath}`);
      throw new NotFoundException('Accès non autorisé.');
    }

    // Définir le Content-Type approprié
    if (pathString.endsWith('.m3u8')) {
      res.setHeader('Content-Type', 'application/x-mpegURL');
    } else if (pathString.endsWith('.ts')) {
      res.setHeader('Content-Type', 'video/mp2t');
    } else if (pathString.endsWith('.m4s')) {
      res.setHeader('Content-Type', 'video/iso.segment');
    } else if (pathString.endsWith('.vtt')) {
      res.setHeader('Content-Type', 'text/vtt');
    } else {
      res.setHeader('Content-Type', 'application/octet-stream');
    }

    // Headers CORS pour permettre le streaming cross-origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
    res.setHeader(
      'Access-Control-Expose-Headers',
      'Content-Length, Content-Range',
    );

    // Cache control
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Streamer le fichier
    fs.createReadStream(fullPath).pipe(res);
  }
}
