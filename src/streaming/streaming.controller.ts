import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { StreamingService } from './streaming.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('streaming')
@UseGuards(JwtAuthGuard)
@Controller('streaming')
@ApiBearerAuth()
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  @Get(':filePath')
  @ApiOperation({ summary: 'Diffuser un fichier vidéo' })
  @ApiParam({
    name: 'filePath',
    description: 'Chemin du fichier vidéo à diffuser',
    type: String,
    example: 'path/to/your/video.mp4',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Flux vidéo en cours de diffusion',
    content: {
      'video/mp4': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fichier non trouvé',
  })
  streamFile(@Param('filePath') filePath: string, @Res() res: Response) {
    // Note: Dans une application réelle, vous devriez valider le chemin du fichier
    // pour éviter les attaques de traversée de répertoire.
    // Pour cet exemple, nous supposons que filePath est sûr.
    this.streamingService.streamFile(filePath, res);
  }
}
