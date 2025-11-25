import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('tmdb')
@UseGuards(JwtAuthGuard)
@Controller('tmdb')
@ApiBearerAuth()
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get('search')
  @ApiOperation({ summary: 'Rechercher des films par mot-clé' })
  @ApiQuery({
    name: 'query',
    description: 'Mot-clé de recherche pour les films',
    type: String,
    example: 'Inception',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des films trouvés',
    // type: [MovieSearchResultDto], // Vous pouvez créer un DTO pour le résultat de la recherche
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async searchMovies(@Query('query') query: string): Promise<any> {
    return this.tmdbService.searchMovies(query);
  }

  @Get('movie/:id')
  @ApiOperation({ summary: "Obtenir les détails d'un film par ID" })
  @ApiParam({
    name: 'id',
    description: 'ID du film TMDB',
    type: String,
    example: '27205',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails du film',
    // type: MovieDetailsDto, // Vous pouvez créer un DTO pour les détails du film
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Film non trouvé',
  })
  async getMovieDetails(@Param('id') id: string): Promise<any> {
    return this.tmdbService.getMovieDetails(parseInt(id, 10));
  }

  @Get('popular/movie')
  @ApiOperation({ summary: 'Obtenir la liste des films populaires' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des films populaires',
    // type: [MovieDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getPopularMovies(): Promise<any> {
    return this.tmdbService.getPopularMovies();
  }

  @Get('popular/tv')
  @ApiOperation({ summary: 'Obtenir la liste des séries TV populaires' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des séries TV populaires',
    // type: [TvShowDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getPopularTVShows(): Promise<any> {
    return this.tmdbService.getPopularTVShows();
  }

  @Get('tv/:id')
  @ApiOperation({ summary: "Obtenir les détails d'une série TV par ID" })
  @ApiParam({
    name: 'id',
    description: 'ID de la série TV TMDB',
    type: String,
    example: '1399',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails de la série TV',
    // type: TvShowDetailsDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Série TV non trouvée',
  })
  async getTVShowDetails(@Param('id') id: string): Promise<any> {
    return this.tmdbService.getTVShowDetails(parseInt(id, 10));
  }

  @Get('trending/:time_window')
  @ApiOperation({ summary: 'Obtenir les films tendances' })
  @ApiParam({
    name: 'time_window',
    description: 'Fenêtre de temps (day ou week)',
    type: String,
    enum: ['day', 'week'],
    example: 'day',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des films tendances',
    // type: [MovieDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getTrendingMovies(
    @Param('time_window') time_window: 'day' | 'week',
  ): Promise<any> {
    return this.tmdbService.getTrendingMovies(time_window);
  }

  @Get('top-rated')
  @ApiOperation({ summary: 'Obtenir les films les mieux notés' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des films les mieux notés',
    // type: [MovieDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getTopRatedMovies(): Promise<any> {
    return this.tmdbService.getTopRatedMovies();
  }

  @Get('now-playing')
  @ApiOperation({ summary: 'Obtenir les films en cours de lecture' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des films en cours de lecture',
    // type: [MovieDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getNowPlayingMovies(): Promise<any> {
    return this.tmdbService.getNowPlayingMovies();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Obtenir les films à venir' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des films à venir',
    // type: [MovieDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getUpcomingMovies(): Promise<any> {
    return this.tmdbService.getUpcomingMovies();
  }

  @Get('discover/movie')
  @ApiOperation({ summary: 'Découvrir des films par genre' })
  @ApiQuery({
    name: 'genreId',
    description: 'ID du genre pour la découverte de films',
    type: String,
    example: '28', // Action
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des films découverts par genre',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async discoverMoviesByGenre(@Query('genreId') genreId: string): Promise<any> {
    return this.tmdbService.discoverMoviesByGenre(parseInt(genreId, 10));
  }

  @Get('genres/movie')
  @ApiOperation({ summary: 'Obtenir la liste des genres de films' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des genres de films',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getMovieGenres(): Promise<any> {
    return this.tmdbService.getMovieGenres();
  }
}
