import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Put,
  HttpStatus,
} from '@nestjs/common';
import { ViewingHistoryService } from '@src/viewing-history/viewing-history.service';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard/jwt-auth.guard';
import { GetUser } from '@src/auth/get-user.decorator';
import { User } from '@src/users/entities/user/user';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UpdateViewingHistoryDto } from './dto/update-viewing-history.dto';
import { ViewingHistory } from './entities/viewing-history.entity';

@ApiTags('viewing-history')
@Controller('viewing-history')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ViewingHistoryController {
  constructor(private readonly viewingHistoryService: ViewingHistoryService) {}

  @Post()
  @Put() // Utiliser PUT pour les mises à jour et POST pour la création initiale si l'élément n'existe pas
  @ApiOperation({
    summary: "Mettre à jour ou créer un élément de l'historique de visionnage",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Historique de visionnage mis à jour ou créé',
    type: ViewingHistory,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @ApiBody({ type: UpdateViewingHistoryDto })
  async updateViewingHistory(
    @GetUser() user: User,
    @Body() updateViewingHistoryDto: UpdateViewingHistoryDto,
  ): Promise<ViewingHistory> {
    const { tmdbId, mediaType, title, posterPath, progress } =
      updateViewingHistoryDto;
    return this.viewingHistoryService.updateViewingHistory(
      user.id,
      tmdbId,
      mediaType,
      title,
      posterPath,
      progress,
    );
  }

  @Get()
  @ApiOperation({
    summary: "Obtenir l'historique de visionnage de l'utilisateur",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Historique de visionnage de l'utilisateur",
    type: [ViewingHistory],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getViewingHistory(@GetUser() user: User): Promise<ViewingHistory[]> {
    return this.viewingHistoryService.getViewingHistory(user.id);
  }

  @Delete(':tmdbId/:mediaType')
  @ApiOperation({
    summary: "Supprimer un élément de l'historique de visionnage",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Élément supprimé de l'historique de visionnage",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @ApiParam({
    name: 'tmdbId',
    description: 'ID TMDB du média à supprimer',
    type: Number,
    example: 12345,
  })
  @ApiParam({
    name: 'mediaType',
    description: 'Type de média (movie, tv) à supprimer',
    type: String,
    example: 'movie',
  })
  async removeViewingHistoryItem(
    @GetUser() user: User,
    @Param('tmdbId') tmdbId: number,
    @Param('mediaType') mediaType: string,
  ) {
    await this.viewingHistoryService.removeViewingHistoryItem(
      user.id,
      tmdbId,
      mediaType,
    );
    return { message: 'Item removed from viewing history' };
  }
}
