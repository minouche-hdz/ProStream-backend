import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
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
import { AddWatchlistItemDto } from './dto/add-watchlist-item.dto';
import { Watchlist } from './entities/watchlist.entity';

@ApiTags('watchlist')
@Controller('watchlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Post()
  @ApiOperation({ summary: 'Ajouter un média à la liste de surveillance' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Média ajouté à la liste de surveillance',
    type: Watchlist,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @ApiBody({ type: AddWatchlistItemDto })
  async addToWatchlist(
    @GetUser() user: User,
    @Body() addWatchlistItemDto: AddWatchlistItemDto,
  ): Promise<Watchlist> {
    const { tmdbId, mediaType, title, posterPath } = addWatchlistItemDto;
    return this.watchlistService.addToWatchlist(
      user.id,
      tmdbId,
      mediaType,
      title,
      posterPath,
    );
  }

  @Delete(':tmdbId/:mediaType')
  @ApiOperation({ summary: 'Supprimer un média de la liste de surveillance' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Média supprimé de la liste de surveillance',
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
  async removeFromWatchlist(
    @GetUser() user: User,
    @Param('tmdbId') tmdbId: number,
    @Param('mediaType') mediaType: string,
  ) {
    await this.watchlistService.removeFromWatchlist(user.id, tmdbId, mediaType);
    return { message: 'Item removed from watchlist' };
  }

  @Get()
  @ApiOperation({
    summary: "Obtenir la liste de surveillance de l'utilisateur",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Liste de surveillance de l'utilisateur",
    type: [Watchlist],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getWatchlist(@GetUser() user: User): Promise<Watchlist[]> {
    return this.watchlistService.getWatchlist(user.id);
  }
}
