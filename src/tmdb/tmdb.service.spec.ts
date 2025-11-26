import { Test, TestingModule } from '@nestjs/testing';
import { TmdbService } from './tmdb.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  TmdbMovieSearchResult,
  TmdbMovieDetails,
  TmdbTVShowSearchResult,
  TmdbTVShowDetails,
} from './interfaces/tmdb.interface';

describe('TmdbService', () => {
  let service: TmdbService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mocked_api_key'),
          },
        },
      ],
    }).compile();

    service = module.get<TmdbService>(TmdbService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize TMDB_API_KEY from ConfigService', () => {
    expect(configService.get).toHaveBeenCalledWith('TMDB_API_KEY');
    expect(service['TMDB_API_KEY']).toEqual('mocked_api_key');
  });

  describe('searchMovies', () => {
    const mockMovieSearchResult: TmdbMovieSearchResult = {
      page: 1,
      results: [
        {
          adult: false,
          backdrop_path: '/path/to/backdrop.jpg',
          genre_ids: [1, 2],
          id: 123,
          original_language: 'en',
          original_title: 'Test Movie',
          overview: 'This is a test movie',
          popularity: 100,
          poster_path: '/path/to/poster.jpg',
          release_date: '2023-01-01',
          title: 'Test Movie',
          video: false,
          vote_average: 7.5,
          vote_count: 100,
        },
      ],
      total_pages: 1,
      total_results: 1,
    };

    const mockAxiosResponse: AxiosResponse<TmdbMovieSearchResult> = {
      data: mockMovieSearchResult,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} } as any,
    };

    it('should return a list of movies when searching', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.searchMovies('Test');
      expect(result).toEqual(mockMovieSearchResult);
      expect(httpService.get).toHaveBeenCalledWith(
        `${(service as any).TMDB_BASE_URL}/search/movie?language=${(service as any).LANGUAGE}`,
        {
          params: {
            api_key: (service as any).TMDB_API_KEY,
            query: 'Test',
          },
        },
      );
    });

    it('should throw an error if searchMovies API call fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(service.searchMovies('Test')).rejects.toThrow('API error');
    });
  });

  describe('getMovieDetails', () => {
    const mockMovieDetails: TmdbMovieDetails = {
      adult: false,
      backdrop_path: '/path/to/backdrop.jpg',
      genre_ids: [1, 2],
      id: 123,
      original_language: 'en',
      original_title: 'Test Movie',
      overview: 'This is a test movie',
      popularity: 100,
      poster_path: '/path/to/poster.jpg',
      release_date: '2023-01-01',
      title: 'Test Movie',
      video: false,
      vote_average: 7.5,
      vote_count: 100,
      belongs_to_collection: null,
      budget: 1000000,
      genres: [{ id: 1, name: 'Action' }],
      homepage: 'http://test.com',
      imdb_id: 'tt1234567',
      production_companies: [],
      production_countries: [],
      revenue: 2000000,
      runtime: 120,
      spoken_languages: [],
      status: 'Released',
      tagline: 'A test tagline',
    };

    const mockAxiosResponse: AxiosResponse<TmdbMovieDetails> = {
      data: mockMovieDetails,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} } as any,
    };

    it('should return movie details', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.getMovieDetails(123);
      expect(result).toEqual(mockMovieDetails);
      expect(httpService.get).toHaveBeenCalledWith(
        `${service['TMDB_BASE_URL']}/movie/123?language=${service['LANGUAGE']}`,
        {
          params: {
            api_key: (service as any).TMDB_API_KEY,
          },
        },
      );
    });

    it('should throw an error if getMovieDetails API call fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(service.getMovieDetails(123)).rejects.toThrow('API error');
    });
  });

  describe('getPopularMovies', () => {
    const mockPopularMovies: TmdbMovieSearchResult = {
      page: 1,
      results: [
        {
          adult: false,
          backdrop_path: '/path/to/backdrop.jpg',
          genre_ids: [1, 2],
          id: 456,
          original_language: 'en',
          original_title: 'Popular Movie',
          overview: 'This is a popular movie',
          popularity: 200,
          poster_path: '/path/to/poster.jpg',
          release_date: '2023-02-01',
          title: 'Popular Movie',
          video: false,
          vote_average: 8.0,
          vote_count: 200,
        },
      ],
      total_pages: 1,
      total_results: 1,
    };

    const mockAxiosResponse: AxiosResponse<TmdbMovieSearchResult> = {
      data: mockPopularMovies,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} } as any,
    };

    it('should return popular movies', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.getPopularMovies();
      expect(result).toEqual(mockPopularMovies);
      expect(httpService.get).toHaveBeenCalledWith(
        `${service['TMDB_BASE_URL']}/movie/popular?language=${service['LANGUAGE']}`,
        {
          params: {
            api_key: (service as any).TMDB_API_KEY,
          },
        },
      );
    });

    it('should throw an error if getPopularMovies API call fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(service.getPopularMovies()).rejects.toThrow('API error');
    });
  });

  describe('getPopularTVShows', () => {
    const mockPopularTVShows: TmdbTVShowSearchResult = {
      page: 1,
      results: [
        {
          backdrop_path: '/path/to/tv_backdrop.jpg',
          first_air_date: '2022-01-01',
          genre_ids: [3, 4],
          id: 789,
          name: 'Popular TV Show',
          origin_country: ['US'],
          original_language: 'en',
          original_name: 'Popular TV Show',
          overview: 'This is a popular TV show',
          popularity: 150,
          poster_path: '/path/to/tv_poster.jpg',
          vote_average: 8.5,
          vote_count: 150,
        },
      ],
      total_pages: 1,
      total_results: 1,
    };

    const mockAxiosResponse: AxiosResponse<TmdbTVShowSearchResult> = {
      data: mockPopularTVShows,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} } as any,
    };

    it('should return popular TV shows', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.getPopularTVShows();
      expect(result).toEqual(mockPopularTVShows);
      expect(httpService.get).toHaveBeenCalledWith(
        `${service['TMDB_BASE_URL']}/tv/popular?language=${service['LANGUAGE']}`,
        {
          params: {
            api_key: (service as any).TMDB_API_KEY,
          },
        },
      );
    });

    it('should throw an error if getPopularTVShows API call fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(service.getPopularTVShows()).rejects.toThrow('API error');
    });
  });

  describe('getTVShowDetails', () => {
    const mockTVShowDetails: TmdbTVShowDetails = {
      backdrop_path: '/path/to/tv_backdrop.jpg',
      first_air_date: '2022-01-01',
      genre_ids: [3, 4],
      id: 789,
      name: 'Test TV Show',
      origin_country: ['US'],
      original_language: 'en',
      original_name: 'Test TV Show',
      overview: 'This is a test TV show',
      popularity: 150,
      poster_path: '/path/to/tv_poster.jpg',
      vote_average: 8.5,
      vote_count: 150,
      created_by: [],
      episode_run_time: [60],
      genres: [{ id: 3, name: 'Drama' }],
      homepage: 'http://testtv.com',
      in_production: true,
      languages: ['en'],
      last_air_date: '2023-01-01',
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
      number_of_episodes: 10,
      number_of_seasons: 1,
      production_companies: [],
      production_countries: [],
      seasons: [],
      spoken_languages: [],
      status: 'Returning Series',
      tagline: 'A TV show tagline',
      type: 'Scripted',
    };

    const mockAxiosResponse: AxiosResponse<TmdbTVShowDetails> = {
      data: mockTVShowDetails,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} } as any,
    };

    it('should return TV show details', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.getTVShowDetails(789);
      expect(result).toEqual(mockTVShowDetails);
      expect(httpService.get).toHaveBeenCalledWith(
        `${service['TMDB_BASE_URL']}/tv/789?language=${service['LANGUAGE']}`,
        {
          params: {
            api_key: (service as any).TMDB_API_KEY,
          },
        },
      );
    });

    it('should throw an error if getTVShowDetails API call fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(service.getTVShowDetails(789)).rejects.toThrow('API error');
    });
  });

  describe('getTrendingMovies', () => {
    const mockTrendingMovies: TmdbMovieSearchResult = {
      page: 1,
      results: [
        {
          adult: false,
          backdrop_path: '/path/to/backdrop.jpg',
          genre_ids: [1, 2],
          id: 111,
          original_language: 'en',
          original_title: 'Trending Movie',
          overview: 'This is a trending movie',
          popularity: 300,
          poster_path: '/path/to/poster.jpg',
          release_date: '2023-03-01',
          title: 'Trending Movie',
          video: false,
          vote_average: 8.2,
          vote_count: 300,
        },
      ],
      total_pages: 1,
      total_results: 1,
    };

    const mockAxiosResponse: AxiosResponse<TmdbMovieSearchResult> = {
      data: mockTrendingMovies,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} } as any,
    };

    it('should return trending movies for a day', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.getTrendingMovies('day');
      expect(result).toEqual(mockTrendingMovies);
      expect(httpService.get).toHaveBeenCalledWith(
        `${service['TMDB_BASE_URL']}/trending/movie/day?language=${service['LANGUAGE']}`,
        {
          params: {
            api_key: (service as any).TMDB_API_KEY,
          },
        },
      );
    });

    it('should return trending movies for a week', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.getTrendingMovies('week');
      expect(result).toEqual(mockTrendingMovies);
      expect(httpService.get).toHaveBeenCalledWith(
        `${service['TMDB_BASE_URL']}/trending/movie/week?language=${service['LANGUAGE']}`,
        {
          params: {
            api_key: (service as any).TMDB_API_KEY,
          },
        },
      );
    });

    it('should throw an error if getTrendingMovies API call fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(service.getTrendingMovies('day')).rejects.toThrow(
        'API error',
      );
    });
  });

  describe('getTopRatedMovies', () => {
    const mockTopRatedMovies: TmdbMovieSearchResult = {
      page: 1,
      results: [
        {
          adult: false,
          backdrop_path: '/path/to/backdrop.jpg',
          genre_ids: [1, 2],
          id: 222,
          original_language: 'en',
          original_title: 'Top Rated Movie',
          overview: 'This is a top rated movie',
          popularity: 400,
          poster_path: '/path/to/poster.jpg',
          release_date: '2023-04-01',
          title: 'Top Rated Movie',
          video: false,
          vote_average: 8.8,
          vote_count: 400,
        },
      ],
      total_pages: 1,
      total_results: 1,
    };

    const mockAxiosResponse: AxiosResponse<TmdbMovieSearchResult> = {
      data: mockTopRatedMovies,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} } as any,
    };

    it('should return top rated movies', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.getTopRatedMovies();
      expect(result).toEqual(mockTopRatedMovies);
      expect(httpService.get).toHaveBeenCalledWith(
        `${service['TMDB_BASE_URL']}/movie/top_rated?language=${service['LANGUAGE']}`,
        {
          params: {
            api_key: (service as any).TMDB_API_KEY,
          },
        },
      );
    });

    it('should throw an error if getTopRatedMovies API call fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(service.getTopRatedMovies()).rejects.toThrow('API error');
    });
  });

  describe('getNowPlayingMovies', () => {
    const mockNowPlayingMovies: TmdbMovieSearchResult = {
      page: 1,
      results: [
        {
          adult: false,
          backdrop_path: '/path/to/backdrop.jpg',
          genre_ids: [1, 2],
          id: 333,
          original_language: 'en',
          original_title: 'Now Playing Movie',
          overview: 'This is a now playing movie',
          popularity: 500,
          poster_path: '/path/to/poster.jpg',
          release_date: '2023-05-01',
          title: 'Now Playing Movie',
          video: false,
          vote_average: 8.5,
          vote_count: 500,
        },
      ],
      total_pages: 1,
      total_results: 1,
    };

    const mockAxiosResponse: AxiosResponse<TmdbMovieSearchResult> = {
      data: mockNowPlayingMovies,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} } as any,
    };

    it('should return now playing movies', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.getNowPlayingMovies();
      expect(result).toEqual(mockNowPlayingMovies);
      expect(httpService.get).toHaveBeenCalledWith(
        `${service['TMDB_BASE_URL']}/movie/now_playing?language=${service['LANGUAGE']}`,
        {
          params: {
            api_key: (service as any).TMDB_API_KEY,
          },
        },
      );
    });

    it('should throw an error if getNowPlayingMovies API call fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(service.getNowPlayingMovies()).rejects.toThrow('API error');
    });
  });

  describe('getUpcomingMovies', () => {
    const mockUpcomingMovies: TmdbMovieSearchResult = {
      page: 1,
      results: [
        {
          adult: false,
          backdrop_path: '/path/to/backdrop.jpg',
          genre_ids: [1, 2],
          id: 444,
          original_language: 'en',
          original_title: 'Upcoming Movie',
          overview: 'This is an upcoming movie',
          popularity: 600,
          poster_path: '/path/to/poster.jpg',
          release_date: '2023-06-01',
          title: 'Upcoming Movie',
          video: false,
          vote_average: 8.7,
          vote_count: 600,
        },
      ],
      total_pages: 1,
      total_results: 1,
    };

    const mockAxiosResponse: AxiosResponse<TmdbMovieSearchResult> = {
      data: mockUpcomingMovies,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} } as any,
    };

    it('should return upcoming movies', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.getUpcomingMovies();
      expect(result).toEqual(mockUpcomingMovies);
      expect(httpService.get).toHaveBeenCalledWith(
        `${service['TMDB_BASE_URL']}/movie/upcoming?language=${service['LANGUAGE']}`,
        {
          params: {
            api_key: (service as any).TMDB_API_KEY,
          },
        },
      );
    });

    it('should throw an error if getUpcomingMovies API call fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(service.getUpcomingMovies()).rejects.toThrow('API error');
    });
  });

  describe('discoverMovies', () => {
    const mockDiscoverMovies: TmdbMovieSearchResult = {
      page: 1,
      results: [
        {
          adult: false,
          backdrop_path: '/path/to/backdrop.jpg',
          genre_ids: [1, 2],
          id: 555,
          original_language: 'en',
          original_title: 'Discovered Movie',
          overview: 'This is a discovered movie',
          popularity: 700,
          poster_path: '/path/to/poster.jpg',
          release_date: '2023-07-01',
          title: 'Discovered Movie',
          video: false,
          vote_average: 8.9,
          vote_count: 700,
        },
      ],
      total_pages: 1,
      total_results: 1,
    };

    const mockAxiosResponse: AxiosResponse<TmdbMovieSearchResult> = {
      data: mockDiscoverMovies,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} } as any,
    };

    it('should return discovered movies with given parameters', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const params = { sort_by: 'popularity.desc', primary_release_year: 2023 };
      const result = await service.discoverMovies(params);
      expect(result).toEqual(mockDiscoverMovies);
      expect(httpService.get).toHaveBeenCalledWith(
        `${service['TMDB_BASE_URL']}/discover/movie`,
        {
          params: {
            api_key: (service as any).TMDB_API_KEY,
            language: (service as any).LANGUAGE,
            ...params,
          },
        },
      );
    });

    it('should throw an error if discoverMovies API call fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(service.discoverMovies({})).rejects.toThrow('API error');
    });
  });

  describe('discoverMoviesByGenre', () => {
    const mockDiscoverMoviesByGenre: TmdbMovieSearchResult = {
      page: 1,
      results: [
        {
          adult: false,
          backdrop_path: '/path/to/backdrop.jpg',
          genre_ids: [1, 2],
          id: 666,
          original_language: 'en',
          original_title: 'Genre Movie',
          overview: 'This is a genre movie',
          popularity: 800,
          poster_path: '/path/to/poster.jpg',
          release_date: '2023-08-01',
          title: 'Genre Movie',
          video: false,
          vote_average: 9.0,
          vote_count: 800,
        },
      ],
      total_pages: 1,
      total_results: 1,
    };

    const mockAxiosResponse: AxiosResponse<TmdbMovieSearchResult> = {
      data: mockDiscoverMoviesByGenre,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} } as any,
    };

    it('should return discovered movies by genre', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.discoverMoviesByGenre(28); // Action genre
      expect(result).toEqual(mockDiscoverMoviesByGenre);
      expect(httpService.get).toHaveBeenCalledWith(
        `${service['TMDB_BASE_URL']}/discover/movie`,
        {
          params: {
            api_key: (service as any).TMDB_API_KEY,
            language: (service as any).LANGUAGE,
            with_genres: 28,
          },
        },
      );
    });

    it('should throw an error if discoverMoviesByGenre API call fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(service.discoverMoviesByGenre(28)).rejects.toThrow(
        'API error',
      );
    });
  });

  describe('getMovieGenres', () => {
    const mockMovieGenres = {
      genres: [
        { id: 1, name: 'Action' },
        { id: 2, name: 'Comedy' },
      ],
    };

    const mockAxiosResponse: AxiosResponse<any> = {
      data: mockMovieGenres,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} } as any,
    };

    it('should return movie genres', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.getMovieGenres();
      expect(result).toEqual(mockMovieGenres);
      expect(httpService.get).toHaveBeenCalledWith(
        `${service['TMDB_BASE_URL']}/genre/movie/list?language=${service['LANGUAGE']}`,
        {
          params: {
            api_key: (service as any).TMDB_API_KEY,
          },
        },
      );
    });

    it('should throw an error if getMovieGenres API call fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(service.getMovieGenres()).rejects.toThrow('API error');
    });
  });

  describe('getMovieCredits', () => {
    const mockMovieCredits = {
      id: 123,
      cast: [{ name: 'Actor 1', character: 'Character 1' }],
      crew: [{ name: 'Director 1', job: 'Director' }],
    };

    const mockAxiosResponse: AxiosResponse<any> = {
      data: mockMovieCredits,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} } as any,
    };

    it('should return movie credits', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.getMovieCredits(123);
      expect(result).toEqual(mockMovieCredits);
      expect(httpService.get).toHaveBeenCalledWith(
        `${service['TMDB_BASE_URL']}/movie/123/credits?language=${service['LANGUAGE']}`,
        {
          params: {
            api_key: (service as any).TMDB_API_KEY,
          },
        },
      );
    });

    it('should throw an error if getMovieCredits API call fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(service.getMovieCredits(123)).rejects.toThrow('API error');
    });
  });

  describe('getMovieVideos', () => {
    const mockMovieVideos = {
      id: 123,
      results: [
        { name: 'Trailer', key: 'abc', site: 'YouTube', type: 'Trailer' },
      ],
    };

    const mockAxiosResponse: AxiosResponse<any> = {
      data: mockMovieVideos,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} } as any,
    };

    it('should return movie videos', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.getMovieVideos(123);
      expect(result).toEqual(mockMovieVideos);
      expect(httpService.get).toHaveBeenCalledWith(
        `${service['TMDB_BASE_URL']}/movie/123/videos?language=${service['LANGUAGE']}`,
        {
          params: {
            api_key: (service as any).TMDB_API_KEY,
          },
        },
      );
    });

    it('should throw an error if getMovieVideos API call fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(service.getMovieVideos(123)).rejects.toThrow('API error');
    });
  });
});
