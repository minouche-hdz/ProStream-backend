import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tmdb')
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get('search')
  async searchMovies(@Query('query') query: string): Promise<any> {
    return this.tmdbService.searchMovies(query);
  }

  @Get('movie/:id')
  async getMovieDetails(@Param('id') id: string): Promise<any> {
    return this.tmdbService.getMovieDetails(parseInt(id, 10));
  }

  @Get('popular/movie')
  async getPopularMovies(): Promise<any> {
    return this.tmdbService.getPopularMovies();
  }

  @Get('popular/tv')
  async getPopularTVShows(): Promise<any> {
    return this.tmdbService.getPopularTVShows();
  }

  @Get('tv/:id')
  async getTVShowDetails(@Param('id') id: string): Promise<any> {
    return this.tmdbService.getTVShowDetails(parseInt(id, 10));
  }
}
