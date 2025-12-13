import { ApiProperty } from '@nestjs/swagger';

export class ProwlarrItemDto {
  @ApiProperty({
    description: 'Titre du média',
    example: 'The Mandalorian S01E01',
  })
  title: string;

  @ApiProperty({
    description: 'Taille du fichier en octets',
    example: 1234567890,
  })
  size: number;

  @ApiProperty({
    description: 'Date de publication',
    example: '2019-11-12T08:00:00Z',
  })
  publishDate: string;

  @ApiProperty({
    description: 'URL de téléchargement',
    example: 'http://example.com/download/...',
  })
  downloadUrl: string;

  @ApiProperty({
    description: 'GUID du média',
    example: 'https://download_torrent?id=1369131',
  })
  guid: string;

  @ApiProperty({
    description: 'Âge du média en jours',
    example: 66,
  })
  age: number;

  @ApiProperty({
    description: 'Âge du média en heures',
    example: 1594.5480831944444,
  })
  ageHours: number;

  @ApiProperty({
    description: 'Âge du média en minutes',
    example: 95672.88499167167,
  })
  ageMinutes: number;

  @ApiProperty({
    description: 'Nombre de téléchargements',
    example: 103,
  })
  grabs: number;

  @ApiProperty({
    description: "ID de l'indexeur",
    example: 3,
  })
  indexerId: number;

  @ApiProperty({
    description: "Nom de l'indexeur",
    example: 'YggTorrent',
  })
  indexer: string;

  @ApiProperty({
    description: 'Titre trié du média',
    example: 'inception 2010 french 1080p web hdr10 h265',
  })
  sortTitle: string;

  @ApiProperty({
    description: 'ID IMDb',
    example: 0,
  })
  imdbId: number;

  @ApiProperty({
    description: 'ID TMDb',
    example: 0,
  })
  tmdbId: number;

  @ApiProperty({
    description: 'ID TVDb',
    example: 0,
  })
  tvdbId: number;

  @ApiProperty({
    description: 'ID TVMaze',
    example: 0,
  })
  tvMazeId: number;

  @ApiProperty({
    description: "URL d'information",
    example: 'https://nception+2010+french+1080p+web+hdr10+h265',
  })
  infoUrl: string;

  @ApiProperty({
    type: [String],
    description: "Flags de l'indexeur",
    example: [],
  })
  indexerFlags: string[];

  @ApiProperty({
    description: 'Nombre de seeders',
    example: 12,
  })
  seeders: number;

  @ApiProperty({
    description: 'Nombre de leechers',
    example: 0,
  })
  leechers: number;

  @ApiProperty({
    description: 'Protocole de téléchargement',
    example: 'torrent',
  })
  protocol: string;

  @ApiProperty({
    description: 'Nom du fichier',
    example: 'Inception.2010.FRENCH.1080p.WEB.HDR10.H265.torrent',
  })
  fileName: string;
}

export class ProwlarrSearchResultDto {
  @ApiProperty({
    type: [ProwlarrItemDto],
    description: 'Liste des résultats de recherche',
  })
  results: ProwlarrItemDto[];
}

export class ProwlarrIndexerDto {
  @ApiProperty({
    type: [String],
    description: 'URLs des indexeurs',
    example: ['http://indexer1.com', 'http://indexer2.com'],
  })
  indexerUrls: string[];

  @ApiProperty({
    description: "Nom de la définition de l'indexeur",
    example: 'torrentleech',
  })
  definitionName: string;
}
