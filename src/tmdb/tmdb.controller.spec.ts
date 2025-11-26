import { Test, TestingModule } from '@nestjs/testing';
import { TmdbController } from './tmdb.controller';
import { TmdbService } from './tmdb.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import {
  TmdbMovieSearchResultDto,
  TmdbMovieDetailsDto,
  TmdbTVShowSearchResultDto,
  TmdbTVShowDetailsDto,
} from './dto/tmdb-responses.dto';

describe('TmdbController', () => {
  let controller: TmdbController;
  // let service: TmdbService; // Removed as it's not used

  const mockTmdbService = {
    searchMovies: jest.fn(),
    getMovieDetails: jest.fn(),
    getPopularMovies: jest.fn(),
    getPopularTVShows: jest.fn(),
    getTVShowDetails: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TmdbController],
      providers: [
        {
          provide: TmdbService,
          useValue: mockTmdbService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // Bypass JwtAuthGuard for controller tests
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TmdbController>(TmdbController);
    // service = module.get<TmdbService>(TmdbService); // Removed as it's not used

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchMovies', () => {
    it('should return movie search results', async () => {
      const query = 'test';
      const mockResult: TmdbMovieSearchResultDto = {
        page: 1,
        results: [
          {
            id: 1,
            title: 'Test Movie',
            adult: false,
            backdrop_path: '',
            genre_ids: [],
            original_language: '',
            original_title: '',
            overview: '',
            popularity: 0,
            poster_path: '',
            release_date: '',
            video: false,
            vote_average: 0,
            vote_count: 0,
          },
        ],
        total_pages: 1,
        total_results: 1,
      };
      mockTmdbService.searchMovies.mockResolvedValue(mockResult);

      const result = await controller.searchMovies(query);
      expect(mockTmdbService.searchMovies).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getMovieDetails', () => {
    it('should return movie details', async () => {
      const id = '123';
      const mockResult: TmdbMovieDetailsDto = {
        id: 123,
        title: 'Test Movie',
        adult: false,
        backdrop_path: '',
        belongs_to_collection: null,
        budget: 0,
        genres: [],
        homepage: '',
        imdb_id: '',
        original_language: '',
        original_title: '',
        overview: '',
        popularity: 0,
        poster_path: '',
        production_companies: [],
        production_countries: [],
        release_date: '',
        revenue: 0,
        runtime: 0,
        spoken_languages: [],
        status: '',
        tagline: '',
        video: false,
        vote_average: 0,
        vote_count: 0,
        genre_ids: [],
      };
      mockTmdbService.getMovieDetails.mockResolvedValue(mockResult);

      const result = await controller.getMovieDetails(id);
      expect(mockTmdbService.getMovieDetails).toHaveBeenCalledWith(
        parseInt(id, 10),
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getPopularMovies', () => {
    it('should return popular movies', async () => {
      const mockResult: TmdbMovieSearchResultDto = {
        page: 1,
        results: [
          {
            id: 1,
            title: 'Popular Movie',
            adult: false,
            backdrop_path: '',
            genre_ids: [],
            original_language: '',
            original_title: '',
            overview: '',
            popularity: 0,
            poster_path: '',
            release_date: '',
            video: false,
            vote_average: 0,
            vote_count: 0,
          },
        ],
        total_pages: 1,
        total_results: 1,
      };
      mockTmdbService.getPopularMovies.mockResolvedValue(mockResult);

      const result = await controller.getPopularMovies();
      expect(mockTmdbService.getPopularMovies).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('getPopularTVShows', () => {
    it('should return popular TV shows', async () => {
      const mockResult: TmdbTVShowSearchResultDto = {
        page: 1,
        results: [
          {
            id: 1,
            name: 'Popular TV Show',
            backdrop_path: '',
            first_air_date: '',
            genre_ids: [],
            origin_country: [],
            original_language: '',
            original_name: '',
            overview: '',
            popularity: 0,
            poster_path: '',
            vote_average: 0,
            vote_count: 0,
          },
        ],
        total_pages: 1,
        total_results: 1,
      };
      mockTmdbService.getPopularTVShows.mockResolvedValue(mockResult);

      const result = await controller.getPopularTVShows();
      expect(mockTmdbService.getPopularTVShows).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('getTVShowDetails', () => {
    it('should return TV show details', async () => {
      const id = '456';
      const mockResult: TmdbTVShowDetailsDto = {
        id: 456,
        name: 'Test TV Show',
        backdrop_path: '',
        created_by: [],
        episode_run_time: [],
        first_air_date: '',
        genres: [],
        homepage: '',
        in_production: false,
        languages: [],
        last_air_date: '',
        last_episode_to_air: {
          id: 1,
          name: 'Episode 1',
          overview: 'First episode',
          vote_average: 8.0,
          vote_count: 50,
          air_date: '2022-01-01',
          episode_number: 1,
          episode_type: 'standard',
          production_code: '',
          runtime: 60,
          season_number: 1,
          show_id: 789,
          still_path: null,
        },
        next_episode_to_air: null,
        networks: [],
        number_of_episodes: 0,
        number_of_seasons: 0,
        origin_country: [],
        original_language: '',
        original_name: '',
        overview: '',
        popularity: 0,
        poster_path: '',
        production_companies: [],
        production_countries: [],
        seasons: [],
        spoken_languages: [],
        status: '',
        tagline: '',
        type: '',
        vote_average: 0,
        vote_count: 0,
        genre_ids: [],
      };
      mockTmdbService.getTVShowDetails.mockResolvedValue(mockResult);

      const result = await controller.getTVShowDetails(id);
      expect(mockTmdbService.getTVShowDetails).toHaveBeenCalledWith(
        parseInt(id, 10),
      );
      expect(result).toEqual(mockResult);
    });
  });
});
