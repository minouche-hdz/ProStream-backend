import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { StreamingService } from './streaming.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import type { Response } from 'express'; // Corrected import

@UseGuards(JwtAuthGuard)
@Controller('streaming')
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  @Get(':filePath')
  streamFile(@Param('filePath') filePath: string, @Res() res: Response) {
    // Note: Dans une application réelle, vous devriez valider le chemin du fichier
    // pour éviter les attaques de traversée de répertoire.
    // Pour cet exemple, nous supposons que filePath est sûr.
    this.streamingService.streamFile(filePath, res);
  }
}
