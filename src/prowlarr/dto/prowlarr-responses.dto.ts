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
