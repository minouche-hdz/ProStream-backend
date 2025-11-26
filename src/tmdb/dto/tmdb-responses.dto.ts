import { ApiProperty } from '@nestjs/swagger';

export class TmdbMovieDto {
  @ApiProperty({
    description: 'Indique si le film est pour adultes',
    example: false,
  })
  adult: boolean;

  @ApiProperty({
    description: "Chemin de l'image de fond",
    example: '/path/to/backdrop.jpg',
    nullable: true,
  })
  backdrop_path: string | null;

  @ApiProperty({
    type: [Number],
    description: 'Liste des IDs de genre',
    example: [28, 12],
  })
  genre_ids: number[];

  @ApiProperty({ description: 'ID du film', example: 27205 })
  id: number;

  @ApiProperty({ description: 'Langue originale', example: 'en' })
  original_language: string;

  @ApiProperty({ description: 'Titre original', example: 'Inception' })
  original_title: string;

  @ApiProperty({
    description: 'Résumé du film',
    example: 'Un voleur qui vole des secrets...',
  })
  overview: string;

  @ApiProperty({ description: 'Popularité du film', example: 123.45 })
  popularity: number;

  @ApiProperty({
    description: "Chemin de l'affiche du film",
    example: '/path/to/poster.jpg',
    nullable: true,
  })
  poster_path: string | null;

  @ApiProperty({ description: 'Date de sortie', example: '2010-07-16' })
  release_date: string;

  @ApiProperty({ description: 'Titre du film', example: 'Inception' })
  title: string;

  @ApiProperty({
    description: 'Indique si le film a une vidéo',
    example: false,
  })
  video: boolean;

  @ApiProperty({ description: 'Moyenne des votes', example: 8.3 })
  vote_average: number;

  @ApiProperty({ description: 'Nombre de votes', example: 25000 })
  vote_count: number;
}

export class TmdbTVShowDto {
  @ApiProperty({
    description: "Chemin de l'image de fond",
    example: '/path/to/backdrop.jpg',
    nullable: true,
  })
  backdrop_path: string | null;

  @ApiProperty({
    description: 'Date de première diffusion',
    example: '2019-11-12',
  })
  first_air_date: string;

  @ApiProperty({
    type: [Number],
    description: 'Liste des IDs de genre',
    example: [10765, 10759],
  })
  genre_ids: number[];

  @ApiProperty({ description: 'ID de la série TV', example: 1399 })
  id: number;

  @ApiProperty({
    description: 'Nom de la série TV',
    example: 'The Mandalorian',
  })
  name: string;

  @ApiProperty({
    type: [String],
    description: "Pays d'origine",
    example: ['US'],
  })
  origin_country: string[];

  @ApiProperty({ description: 'Langue originale', example: 'en' })
  original_language: string;

  @ApiProperty({ description: 'Nom original', example: 'The Mandalorian' })
  original_name: string;

  @ApiProperty({
    description: 'Résumé de la série TV',
    example: 'Un chasseur de primes solitaire...',
  })
  overview: string;

  @ApiProperty({ description: 'Popularité de la série TV', example: 200.5 })
  popularity: number;

  @ApiProperty({
    description: "Chemin de l'affiche de la série TV",
    example: '/path/to/poster.jpg',
    nullable: true,
  })
  poster_path: string | null;

  @ApiProperty({ description: 'Moyenne des votes', example: 8.5 })
  vote_average: number;

  @ApiProperty({ description: 'Nombre de votes', example: 15000 })
  vote_count: number;
}

export class TmdbMovieSearchResultDto {
  @ApiProperty({ description: 'Numéro de page', example: 1 })
  page: number;

  @ApiProperty({
    type: [TmdbMovieDto],
    description: 'Liste des films trouvés',
  })
  results: TmdbMovieDto[];

  @ApiProperty({ description: 'Nombre total de pages', example: 5 })
  total_pages: number;

  @ApiProperty({ description: 'Nombre total de résultats', example: 100 })
  total_results: number;
}

export class TmdbTVShowSearchResultDto {
  @ApiProperty({ description: 'Numéro de page', example: 1 })
  page: number;

  @ApiProperty({
    type: [TmdbTVShowDto],
    description: 'Liste des séries TV trouvées',
  })
  results: TmdbTVShowDto[];

  @ApiProperty({ description: 'Nombre total de pages', example: 3 })
  total_pages: number;

  @ApiProperty({ description: 'Nombre total de résultats', example: 60 })
  total_results: number;
}

export class TmdbGenreDto {
  @ApiProperty({ description: 'ID du genre', example: 28 })
  id: number;

  @ApiProperty({ description: 'Nom du genre', example: 'Action' })
  name: string;
}

export class TmdbMovieGenreResultDto {
  @ApiProperty({
    type: [TmdbGenreDto],
    description: 'Liste des genres de films',
  })
  genres: TmdbGenreDto[];
}

export class TmdbProductionCompanyDto {
  @ApiProperty({
    description: 'ID de la compagnie de production',
    example: 508,
  })
  id: number;

  @ApiProperty({
    description: 'Chemin du logo de la compagnie',
    example: '/path/to/logo.png',
    nullable: true,
  })
  logo_path: string | null;

  @ApiProperty({
    description: 'Nom de la compagnie',
    example: 'Warner Bros. Pictures',
  })
  name: string;

  @ApiProperty({
    description: "Pays d'origine de la compagnie",
    example: 'US',
  })
  origin_country: string;
}

export class TmdbProductionCountryDto {
  @ApiProperty({ description: 'Code ISO 3166-1 du pays', example: 'US' })
  iso_3166_1: string;

  @ApiProperty({
    description: 'Nom du pays',
    example: 'United States of America',
  })
  name: string;
}

export class TmdbSpokenLanguageDto {
  @ApiProperty({ description: 'Nom anglais de la langue', example: 'English' })
  english_name: string;

  @ApiProperty({ description: 'Code ISO 639-1 de la langue', example: 'en' })
  iso_639_1: string;

  @ApiProperty({ description: 'Nom de la langue', example: 'English' })
  name: string;
}

export class TmdbMovieDetailsDto extends TmdbMovieDto {
  @ApiProperty({
    description: 'Collection à laquelle le film appartient',
    nullable: true,
  })
  belongs_to_collection: object | null;

  @ApiProperty({ description: 'Budget du film', example: 160000000 })
  budget: number;

  @ApiProperty({
    type: [TmdbGenreDto],
    description: 'Liste des genres du film',
  })
  genres: TmdbGenreDto[];

  @ApiProperty({
    description: "Page d'accueil du film",
    example: 'http://inceptionmovie.com',
    nullable: true,
  })
  homepage: string | null;

  @ApiProperty({
    description: 'ID IMDb du film',
    example: 'tt1375666',
    nullable: true,
  })
  imdb_id: string | null;

  @ApiProperty({
    type: [TmdbProductionCompanyDto],
    description: 'Compagnies de production',
  })
  production_companies: TmdbProductionCompanyDto[];

  @ApiProperty({
    type: [TmdbProductionCountryDto],
    description: 'Pays de production',
  })
  production_countries: TmdbProductionCountryDto[];

  @ApiProperty({ description: 'Revenus du film', example: 828322122 })
  revenue: number;

  @ApiProperty({
    description: 'Durée du film en minutes',
    example: 148,
    nullable: true,
  })
  runtime: number | null;

  @ApiProperty({
    type: [TmdbSpokenLanguageDto],
    description: 'Langues parlées',
  })
  spoken_languages: TmdbSpokenLanguageDto[];

  @ApiProperty({ description: 'Statut du film', example: 'Released' })
  status: string;

  @ApiProperty({
    description: 'Slogan du film',
    example: 'Your mind is the scene of the crime.',
    nullable: true,
  })
  tagline: string | null;
}

export class TmdbCreatedByDto {
  @ApiProperty({ description: 'ID du créateur', example: 123 })
  id: number;

  @ApiProperty({
    description: 'ID du crédit',
    example: '52542282760ee313280017f9',
  })
  credit_id: string;

  @ApiProperty({ description: 'Nom du créateur', example: 'Jon Favreau' })
  name: string;

  @ApiProperty({
    description: 'Genre du créateur (1=femme, 2=homme, 0=non spécifié)',
    example: 2,
  })
  gender: number;

  @ApiProperty({
    description: 'Chemin du profil du créateur',
    example: '/path/to/profile.jpg',
    nullable: true,
  })
  profile_path: string | null;
}

export class TmdbLastEpisodeToAirDto {
  @ApiProperty({ description: "ID de l'épisode", example: 123456 })
  id: number;

  @ApiProperty({ description: "Nom de l'épisode", example: 'Chapter 1' })
  name: string;

  @ApiProperty({
    description: "Résumé de l'épisode",
    example: 'Le Mandalorien accepte une mission...',
  })
  overview: string;

  @ApiProperty({
    description: "Moyenne des votes de l'épisode",
    example: 8.0,
  })
  vote_average: number;

  @ApiProperty({
    description: "Nombre de votes de l'épisode",
    example: 1000,
  })
  vote_count: number;

  @ApiProperty({
    description: "Date de diffusion de l'épisode",
    example: '2019-11-12',
  })
  air_date: string;

  @ApiProperty({ description: "Numéro de l'épisode", example: 1 })
  episode_number: number;

  @ApiProperty({ description: "Type d'épisode", example: 'standard' })
  episode_type: string;

  @ApiProperty({ description: 'Code de production', example: '' })
  production_code: string;

  @ApiProperty({
    description: "Durée de l'épisode en minutes",
    example: 40,
    nullable: true,
  })
  runtime: number | null;

  @ApiProperty({ description: 'Numéro de la saison', example: 1 })
  season_number: number;

  @ApiProperty({ description: 'ID de la série TV', example: 1399 })
  show_id: number;

  @ApiProperty({
    description: "Chemin de l'image fixe de l'épisode",
    example: '/path/to/still.jpg',
    nullable: true,
  })
  still_path: string | null;
}

export class TmdbNetworkDto {
  @ApiProperty({ description: 'ID du réseau', example: 2739 })
  id: number;

  @ApiProperty({
    description: 'Chemin du logo du réseau',
    example: '/path/to/network_logo.png',
    nullable: true,
  })
  logo_path: string | null;

  @ApiProperty({ description: 'Nom du réseau', example: 'Disney+' })
  name: string;

  @ApiProperty({
    description: "Pays d'origine du réseau",
    example: 'US',
  })
  origin_country: string;
}

export class TmdbSeasonDto {
  @ApiProperty({
    description: 'Date de diffusion de la saison',
    example: '2019-11-12',
  })
  air_date: string;

  @ApiProperty({ description: "Nombre d'épisodes", example: 8 })
  episode_count: number;

  @ApiProperty({ description: 'ID de la saison', example: 107933 })
  id: number;

  @ApiProperty({ description: 'Nom de la saison', example: 'Season 1' })
  name: string;

  @ApiProperty({
    description: 'Résumé de la saison',
    example: 'La première saison de The Mandalorian...',
  })
  overview: string;

  @ApiProperty({
    description: "Chemin de l'affiche de la saison",
    example: '/path/to/season_poster.jpg',
    nullable: true,
  })
  poster_path: string | null;

  @ApiProperty({ description: 'Numéro de la saison', example: 1 })
  season_number: number;

  @ApiProperty({ description: 'Moyenne des votes', example: 8.4 })
  vote_average: number;
}

export class TmdbTVShowDetailsDto extends TmdbTVShowDto {
  @ApiProperty({
    type: [TmdbCreatedByDto],
    description: 'Créateurs de la série TV',
  })
  created_by: TmdbCreatedByDto[];

  @ApiProperty({
    type: [Number],
    description: "Durée d'exécution des épisodes",
    example: [40],
  })
  episode_run_time: number[];

  @ApiProperty({
    type: [TmdbGenreDto],
    description: 'Liste des genres de la série TV',
  })
  genres: TmdbGenreDto[];

  @ApiProperty({
    description: "Page d'accueil de la série TV",
    example: 'http://themandalorian.com',
  })
  homepage: string;

  @ApiProperty({
    description: 'Indique si la série est en production',
    example: true,
  })
  in_production: boolean;

  @ApiProperty({
    type: [String],
    description: 'Langues de la série TV',
    example: ['en'],
  })
  languages: string[];

  @ApiProperty({
    description: 'Date de la dernière diffusion',
    example: '2023-04-19',
  })
  last_air_date: string;

  @ApiProperty({
    type: TmdbLastEpisodeToAirDto,
    description: 'Dernier épisode diffusé',
  })
  last_episode_to_air: TmdbLastEpisodeToAirDto;

  @ApiProperty({
    description: 'Prochain épisode à diffuser',
    nullable: true,
  })
  next_episode_to_air: object | null;

  @ApiProperty({
    type: [TmdbNetworkDto],
    description: 'Réseaux de diffusion',
  })
  networks: TmdbNetworkDto[];

  @ApiProperty({ description: "Nombre total d'épisodes", example: 24 })
  number_of_episodes: number;

  @ApiProperty({ description: 'Nombre total de saisons', example: 3 })
  number_of_seasons: number;

  @ApiProperty({
    type: [TmdbProductionCompanyDto],
    description: 'Compagnies de production',
  })
  production_companies: TmdbProductionCompanyDto[];

  @ApiProperty({
    type: [TmdbProductionCountryDto],
    description: 'Pays de production',
  })
  production_countries: TmdbProductionCountryDto[];

  @ApiProperty({
    type: [TmdbSeasonDto],
    description: 'Saisons de la série TV',
  })
  seasons: TmdbSeasonDto[];

  @ApiProperty({
    type: [TmdbSpokenLanguageDto],
    description: 'Langues parlées',
  })
  spoken_languages: TmdbSpokenLanguageDto[];

  @ApiProperty({
    description: 'Statut de la série TV',
    example: 'Returning Series',
  })
  status: string;

  @ApiProperty({
    description: 'Slogan de la série TV',
    example: 'This is the way.',
  })
  tagline: string;

  @ApiProperty({ description: 'Type de la série TV', example: 'Scripted' })
  type: string;
}

export class TmdbMovieCreditsCastDto {
  @ApiProperty({
    description: "Indique si l'acteur est adulte",
    example: false,
  })
  adult: boolean;

  @ApiProperty({
    description: 'Genre de l\'acteur (1=femme, 2=homme, 0=non spécifié)',
    example: 2,
  })
  gender: number;

  @ApiProperty({ description: "ID de l'acteur", example: 12345 })
  id: number;

  @ApiProperty({ description: 'Département connu', example: 'Acting' })
  known_for_department: string;

  @ApiProperty({ description: "Nom de l'acteur", example: 'Leonardo DiCaprio' })
  name: string;

  @ApiProperty({
    description: "Nom original de l'acteur",
    example: 'Leonardo DiCaprio',
  })
  original_name: string;

  @ApiProperty({ description: "Popularité de l'acteur", example: 50.0 })
  popularity: number;

  @ApiProperty({
    description: "Chemin du profil de l'acteur",
    example: '/path/to/profile.jpg',
    nullable: true,
  })
  profile_path: string | null;

  @ApiProperty({ description: 'ID du cast', example: 1 })
  cast_id: number;

  @ApiProperty({ description: 'Personnage joué', example: 'Dom Cobb' })
  character: string;

  @ApiProperty({
    description: 'ID du crédit',
    example: '52fe43c9c3a368484e00042d',
  })
  credit_id: string;

  @ApiProperty({ description: "Ordre d'apparition", example: 0 })
  order: number;
}

export class TmdbMovieCreditsCrewDto {
  @ApiProperty({
    description: "Indique si le membre de l'équipe est adulte",
    example: false,
  })
  adult: boolean;

  @ApiProperty({
    description:
      "Genre du membre de l'équipe (1=femme, 2=homme, 0=non spécifié)",
    example: 2,
  })
  gender: number;

  @ApiProperty({ description: "ID du membre de l'équipe", example: 67890 })
  id: number;

  @ApiProperty({ description: 'Département connu', example: 'Directing' })
  known_for_department: string;

  @ApiProperty({
    description: "Nom du membre de l'équipe",
    example: 'Christopher Nolan',
  })
  name: string;

  @ApiProperty({
    description: "Nom original du membre de l'équipe",
    example: 'Christopher Nolan',
  })
  original_name: string;

  @ApiProperty({
    description: "Popularité du membre de l'équipe",
    example: 60.0,
  })
  popularity: number;

  @ApiProperty({
    description: "Chemin du profil du membre de l'équipe",
    example: '/path/to/profile.jpg',
    nullable: true,
  })
  profile_path: string | null;

  @ApiProperty({
    description: 'ID du crédit',
    example: '52fe43c9c3a368484e00042e',
  })
  credit_id: string;

  @ApiProperty({ description: 'Département', example: 'Directing' })
  department: string;

  @ApiProperty({ description: 'Fonction', example: 'Director' })
  job: string;
}

export class TmdbMovieCreditsDto {
  @ApiProperty({ description: 'ID du film', example: 27205 })
  id: number;

  @ApiProperty({
    type: [TmdbMovieCreditsCastDto],
    description: 'Liste des acteurs',
  })
  cast: TmdbMovieCreditsCastDto[];

  @ApiProperty({
    type: [TmdbMovieCreditsCrewDto],
    description: "Liste de l'équipe technique",
  })
  crew: TmdbMovieCreditsCrewDto[];
}

export class TmdbVideoDto {
  @ApiProperty({ description: 'Clé de la vidéo', example: 'dQw4w9WgXcQ' })
  iso_639_1: string;

  @ApiProperty({ description: 'Clé de la vidéo', example: 'en' })
  iso_3166_1: string;

  @ApiProperty({ description: 'Nom de la vidéo', example: 'Official Trailer' })
  name: string;

  @ApiProperty({ description: 'Clé YouTube/Vimeo', example: 'dQw4w9WgXcQ' })
  key: string;

  @ApiProperty({ description: 'Site de la vidéo', example: 'YouTube' })
  site: string;

  @ApiProperty({ description: 'Taille de la vidéo', example: 1080 })
  size: number;

  @ApiProperty({ description: 'Type de vidéo', example: 'Trailer' })
  type: string;

  @ApiProperty({
    description: 'Indique si la vidéo est officielle',
    example: true,
  })
  official: boolean;

  @ApiProperty({
    description: 'Date de publication',
    example: '2010-07-16T00:00:00.000Z',
  })
  published_at: string;

  @ApiProperty({
    description: 'ID de la vidéo',
    example: '533ec652c3a3685448000201',
  })
  id: string;
}

export class TmdbMovieVideosDto {
  @ApiProperty({ description: 'ID du film', example: 27205 })
  id: number;

  @ApiProperty({
    type: [TmdbVideoDto],
    description: 'Liste des vidéos du film',
  })
  results: TmdbVideoDto[];
}
