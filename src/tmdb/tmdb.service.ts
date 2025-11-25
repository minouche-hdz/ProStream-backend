import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'; // Corrected import
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios'; // Import AxiosResponse
import {
  TmdbMovieSearchResult,
  TmdbMovieDetails,
  TmdbTVShowSearchResult,
  TmdbTVShowDetails,
} from './interfaces/tmdb.interface';

@Injectable()
export class TmdbService {
  private readonly TMDB_API_KEY: string;
  private readonly TMDB_BASE_URL: string = 'https://api.themoviedb.org/3';
  private readonly LANGUAGE: string = 'fr-FR';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.TMDB_API_KEY = this.configService.get<string>('TMDB_API_KEY') ?? ''; // Added nullish coalescing
  }

  searchMovies(query: string): Promise<TmdbMovieSearchResult> {
    return lastValueFrom(
      this.httpService
        .get(`${this.TMDB_BASE_URL}/search/movie?language=${this.LANGUAGE}`, {
          params: {
            api_key: this.TMDB_API_KEY,
            query,
          },
        })
        .pipe(
          map(
            (response: AxiosResponse<TmdbMovieSearchResult>) => response.data,
          ),
        ),
    );
  }

  getMovieDetails(id: number): Promise<TmdbMovieDetails> {
    return lastValueFrom(
      this.httpService
        .get(`${this.TMDB_BASE_URL}/movie/${id}?language=${this.LANGUAGE}`, {
          params: {
            api_key: this.TMDB_API_KEY,
          },
        })
        .pipe(
          map((response: AxiosResponse<TmdbMovieDetails>) => response.data),
        ),
    );
  }

  getPopularMovies(): Promise<TmdbMovieSearchResult> {
    return lastValueFrom(
      this.httpService
        .get(`${this.TMDB_BASE_URL}/movie/popular?language=${this.LANGUAGE}`, {
          params: {
            api_key: this.TMDB_API_KEY,
          },
        })
        .pipe(
          map(
            (response: AxiosResponse<TmdbMovieSearchResult>) => response.data,
          ),
        ),
    );
  }

  getPopularTVShows(): Promise<TmdbTVShowSearchResult> {
    return lastValueFrom(
      this.httpService
        .get(`${this.TMDB_BASE_URL}/tv/popular?language=${this.LANGUAGE}`, {
          params: {
            api_key: this.TMDB_API_KEY,
          },
        })
        .pipe(
          map(
            (response: AxiosResponse<TmdbTVShowSearchResult>) => response.data,
          ),
        ),
    );
  }

  getTVShowDetails(id: number): Promise<TmdbTVShowDetails> {
    return lastValueFrom(
      this.httpService
        .get(`${this.TMDB_BASE_URL}/tv/${id}?language=${this.LANGUAGE}`, {
          params: {
            api_key: this.TMDB_API_KEY,
          },
        })
        .pipe(
          map((response: AxiosResponse<TmdbTVShowDetails>) => response.data),
        ),
    );
  }

  getTrendingMovies(
    time_window: 'day' | 'week',
  ): Promise<TmdbMovieSearchResult> {
    return lastValueFrom(
      this.httpService
        .get(
          `${this.TMDB_BASE_URL}/trending/movie/${time_window}?language=${this.LANGUAGE}`,
          {
            params: {
              api_key: this.TMDB_API_KEY,
            },
          },
        )
        .pipe(
          map(
            (response: AxiosResponse<TmdbMovieSearchResult>) => response.data,
          ),
        ),
    );
  }

  getTopRatedMovies(): Promise<TmdbMovieSearchResult> {
    return lastValueFrom(
      this.httpService
        .get(
          `${this.TMDB_BASE_URL}/movie/top_rated?language=${this.LANGUAGE}`,
          {
            params: {
              api_key: this.TMDB_API_KEY,
            },
          },
        )
        .pipe(
          map(
            (response: AxiosResponse<TmdbMovieSearchResult>) => response.data,
          ),
        ),
    );
  }

  getNowPlayingMovies(): Promise<TmdbMovieSearchResult> {
    return lastValueFrom(
      this.httpService
        .get(
          `${this.TMDB_BASE_URL}/movie/now_playing?language=${this.LANGUAGE}`,
          {
            params: {
              api_key: this.TMDB_API_KEY,
            },
          },
        )
        .pipe(
          map(
            (response: AxiosResponse<TmdbMovieSearchResult>) => response.data,
          ),
        ),
    );
  }

  getUpcomingMovies(): Promise<TmdbMovieSearchResult> {
    return lastValueFrom(
      this.httpService
        .get(`${this.TMDB_BASE_URL}/movie/upcoming?language=${this.LANGUAGE}`, {
          params: {
            api_key: this.TMDB_API_KEY,
          },
        })
        .pipe(
          map(
            (response: AxiosResponse<TmdbMovieSearchResult>) => response.data,
          ),
        ),
    );
  }

  discoverMoviesByGenre(genreId: number): Promise<TmdbMovieSearchResult> {
    return lastValueFrom(
      this.httpService
        .get(
          `${this.TMDB_BASE_URL}/discover/movie?with_genres=${genreId}&language=${this.LANGUAGE}`,
          {
            params: {
              api_key: this.TMDB_API_KEY,
            },
          },
        )
        .pipe(
          map(
            (response: AxiosResponse<TmdbMovieSearchResult>) => response.data,
          ),
        ),
    );
  }

  getMovieGenres(): Promise<any> {
    return lastValueFrom(
      this.httpService
        .get(`${this.TMDB_BASE_URL}/genre/movie/list?language=${this.LANGUAGE}`, {
          params: {
            api_key: this.TMDB_API_KEY,
          },
        })
        .pipe(map((response: AxiosResponse<any>) => response.data)),
    );
  }
}
