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
import {
  TmdbMovieSearchResultDto,
  TmdbMovieDetailsDto,
  TmdbMovieDto,
  TmdbTVShowDto,
  TmdbTVShowDetailsDto,
  TmdbMovieGenreResultDto,
  TmdbMovieCreditsDto,
  TmdbMovieVideosDto,
} from './dto/tmdb-responses.dto';

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
    type: TmdbMovieSearchResultDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async searchMovies(
    @Query('query') query: string,
  ): Promise<TmdbMovieSearchResultDto> {
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
    type: TmdbMovieDetailsDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Film non trouvé',
  })
  async getMovieDetails(@Param('id') id: string): Promise<TmdbMovieDetailsDto> {
    return this.tmdbService.getMovieDetails(parseInt(id, 10));
  }

  @Get('popular/movie')
  @ApiOperation({ summary: 'Obtenir la liste des films populaires' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des films populaires',
    type: TmdbMovieSearchResultDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getPopularMovies(): Promise<TmdbMovieSearchResultDto> {
    return this.tmdbService.getPopularMovies();
  }

  @Get('popular/tv')
  @ApiOperation({ summary: 'Obtenir la liste des séries TV populaires' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des séries TV populaires',
    type: TmdbTVShowSearchResultDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getPopularTVShows(): Promise<TmdbTVShowSearchResultDto> {
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
    type: TmdbTVShowDetailsDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Série TV non trouvée',
  })
  async getTVShowDetails(
    @Param('id') id: string,
  ): Promise<TmdbTVShowDetailsDto> {
    return this.tmdbService.getTVShowDetails(parseInt(id, 10));
  }

  @Get('trending/movie/:time_window')
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
    type: TmdbMovieSearchResultDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getTrendingMovies(
    @Param('time_window') time_window: 'day' | 'week',
  ): Promise<TmdbMovieSearchResultDto> {
    return this.tmdbService.getTrendingMovies(time_window);
  }

  @Get('top-rated/movie')
  @ApiOperation({ summary: 'Obtenir les films les mieux notés' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des films les mieux notés',
    type: TmdbMovieSearchResultDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getTopRatedMovies(): Promise<TmdbMovieSearchResultDto> {
    return this.tmdbService.getTopRatedMovies();
  }

  @Get('now-playing/movie')
  @ApiOperation({ summary: 'Obtenir les films en cours de lecture' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des films en cours de lecture',
    type: TmdbMovieSearchResultDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getNowPlayingMovies(): Promise<TmdbMovieSearchResultDto> {
    return this.tmdbService.getNowPlayingMovies();
  }

  @Get('upcoming/movie')
  @ApiOperation({ summary: 'Obtenir les films à venir' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des films à venir',
    type: TmdbMovieSearchResultDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getUpcomingMovies(): Promise<TmdbMovieSearchResultDto> {
    return this.tmdbService.getUpcomingMovies();
  }

  @Get('discover/movie')
  @ApiOperation({ summary: 'Découvrir des films par genre' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des films découverts par genre',
    type: TmdbMovieSearchResultDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @Get('discover')
  @ApiOperation({ summary: 'Découvrir des films avec des filtres avancés' })
  @ApiQuery({
    name: 'genreId',
    description: 'ID du genre pour la découverte de films (optionnel)',
    type: String,
    required: false,
    example: '28', // Action
  })
  @ApiQuery({
    name: 'sortBy',
    description: 'Critère de tri (ex: popularity.desc, release_date.desc)',
    type: String,
    required: false,
    example: 'popularity.desc',
  })
  @ApiQuery({
    name: 'year',
    description: 'Année de sortie du film',
    type: String,
    required: false,
    example: '2023',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des films découverts',
    type: TmdbMovieSearchResultDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async discoverMovies(
    @Query() queryParams: any,
  ): Promise<TmdbMovieSearchResultDto> {
    const params: any = {};
    if (queryParams.genreId) {
      params.with_genres = parseInt(queryParams.genreId, 10);
    }
    if (queryParams.sortBy) {
      params.sort_by = queryParams.sortBy;
    }
    if (queryParams.year) {
      params.primary_release_year = parseInt(queryParams.year, 10);
    }
    return this.tmdbService.discoverMovies(params);
  }

  @Get('discover/genre/:genreId')
  @ApiOperation({ summary: 'Découvrir des films par genre' })
  @ApiParam({
    name: 'genreId',
    description: 'ID du genre pour la découverte de films',
    type: String,
    example: '28', // Action
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des films découverts par genre',
    type: TmdbMovieSearchResultDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async discoverMoviesByGenre(
    @Param('genreId') genreId: string,
  ): Promise<TmdbMovieSearchResultDto> {
    return this.tmdbService.discoverMoviesByGenre(parseInt(genreId, 10));
  }

  @Get('genres/movie')
  @ApiOperation({ summary: 'Obtenir la liste des genres de films' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des genres de films',
    type: TmdbMovieGenreResultDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  async getMovieGenres(): Promise<TmdbMovieGenreResultDto> {
    return this.tmdbService.getMovieGenres();
  }

  @Get('movie/:id/credits')
  @ApiOperation({ summary: "Obtenir les crédits d'un film par ID" })
  @ApiParam({
    name: 'id',
    description: 'ID du film TMDB',
    type: String,
    example: '27205',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Crédits du film',
    type: TmdbMovieCreditsDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Film non trouvé',
  })
  async getMovieCredits(@Param('id') id: string): Promise<TmdbMovieCreditsDto> {
    return this.tmdbService.getMovieCredits(parseInt(id, 10));
  }

  @Get('movie/:id/videos')
  @ApiOperation({ summary: "Obtenir les vidéos d'un film par ID" })
  @ApiParam({
    name: 'id',
    description: 'ID du film TMDB',
    type: String,
    example: '27205',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vidéos du film',
    type: TmdbMovieVideosDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Film non trouvé',
  })
  async getMovieVideos(@Param('id') id: string): Promise<TmdbMovieVideosDto> {
    return this.tmdbService.getMovieVideos(parseInt(id, 10));
  }
}
