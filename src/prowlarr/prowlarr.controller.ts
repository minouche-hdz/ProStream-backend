import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProwlarrService } from './prowlarr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
<<<<<<< Updated upstream
=======
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  ProwlarrSearchResultDto,
  ProwlarrIndexerDto,
} from './dto/prowlarr-responses.dto';
>>>>>>> Stashed changes

@UseGuards(JwtAuthGuard)
@Controller('prowlarr')
export class ProwlarrController {
  constructor(private readonly prowlarrService: ProwlarrService) {}

  @Get('search')
<<<<<<< Updated upstream
  async search(@Query('query') query: string) {
=======
  @ApiOperation({ summary: 'Rechercher des médias via Prowlarr' })
  @ApiQuery({
    name: 'query',
    description: 'Requête de recherche pour les médias',
    type: String,
    example: 'The Mandalorian S01E01',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Résultats de la recherche Prowlarr',
    type: ProwlarrSearchResultDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async search(
    @Query('query') query: string,
  ): Promise<ProwlarrSearchResultDto> {
>>>>>>> Stashed changes
    return this.prowlarrService.search(query);
  }

  @Get('indexers')
<<<<<<< Updated upstream
  async getIndexers() {
=======
  @ApiOperation({
    summary: 'Obtenir la liste des indexeurs configurés dans Prowlarr',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des indexeurs Prowlarr',
    type: [ProwlarrIndexerDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getIndexers(): Promise<ProwlarrIndexerDto[]> {
>>>>>>> Stashed changes
    return this.prowlarrService.getIndexers();
  }
}
