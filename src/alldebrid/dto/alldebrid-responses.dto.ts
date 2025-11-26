import { ApiProperty } from '@nestjs/swagger';

export class AlldebridMagnetFileDto {
  @ApiProperty({ description: 'Nom du fichier', example: 'movie.mp4' })
  n: string;

  @ApiProperty({
    description: 'Taille du fichier en octets',
    example: 1234567890,
  })
  s: number;

  @ApiProperty({
    description: 'Lien de streaming direct',
    example: 'http://alldebrid.com/link/...',
  })
  l: string;
}

export class AlldebridMagnetUploadDataDto {
  @ApiProperty({
    description: 'ID du magnet',
    example: '1234567890abcdef12345678',
  })
  id: string;

  @ApiProperty({
    description: 'Nom du fichier',
    example: 'Movie.Name.2023.1080p.WEB.x264.torrent',
  })
  filename: string;

  @ApiProperty({ description: 'Taille du magnet', example: '1.5 GB' })
  size: string;

  @ApiProperty({
    description: 'Hash du magnet',
    example: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
  })
  hash: string;

  @ApiProperty({ description: 'Statut du magnet', example: 'downloading' })
  status: string;

  @ApiProperty({
    description: 'URL de téléchargement',
    example: 'http://alldebrid.com/download/...',
  })
  download_url: string;

  @ApiProperty({
    type: [Object],
    description: 'Liste des fichiers associés au magnet',
  })
  files: any[];
}

export class AlldebridMagnetUploadResponseDto {
  @ApiProperty({ description: 'Statut de la réponse', example: 'success' })
  status: string;

  @ApiProperty({
    type: [AlldebridMagnetUploadDataDto],
    description: 'Données des magnets téléchargés',
  })
  data: {
    magnets: AlldebridMagnetUploadDataDto[];
  };
}

export class AlldebridStreamingLinkDataDto {
  @ApiProperty({
    description: 'Lien de streaming direct',
    example: 'http://alldebrid.com/streaming/...',
  })
  link: string;

  @ApiProperty({ description: 'Nom du fichier', example: 'movie.mp4' })
  name: string;

  @ApiProperty({ description: 'Taille du fichier', example: '1.5 GB' })
  size: string;

  @ApiProperty({ description: 'Type de fichier', example: 'video/mp4' })
  type: string;

  @ApiProperty({
    description: 'Indique si le fichier est streamable',
    example: true,
  })
  streamable: boolean;

  @ApiProperty({ type: [Object], description: 'Liste des fichiers associés' })
  files: any[];
}

export class AlldebridStreamingLinkResponseDto {
  @ApiProperty({ description: 'Statut de la réponse', example: 'success' })
  status: string;

  @ApiProperty({
    type: AlldebridStreamingLinkDataDto,
    description: 'Données du lien de streaming',
  })
  data: AlldebridStreamingLinkDataDto;
}

export class MagnetStatusDto {
  @ApiProperty({
    description: 'ID du magnet',
    example: '1234567890abcdef12345678',
  })
  id: string;

  @ApiProperty({
    description: 'Nom du fichier',
    example: 'Movie.Name.2023.1080p.WEB.x264.torrent',
  })
  filename: string;

  @ApiProperty({
    description: 'Taille du magnet en octets',
    example: 1600000000,
  })
  size: number;

  @ApiProperty({
    description: 'Hash du magnet',
    example: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
  })
  hash: string;

  @ApiProperty({ description: 'Statut du magnet', example: 'ready' })
  status: string;

  @ApiProperty({ description: 'Code de statut', example: 4 })
  statusCode: number;

  @ApiProperty({
    description: 'Date de téléchargement (timestamp)',
    example: 1678886400,
  })
  uploadDate: number;

  @ApiProperty({
    description: 'Date de complétion',
    example: '2023-03-15 10:00:00',
  })
  completionDate: string;

  @ApiProperty({
    type: [AlldebridMagnetFileDto],
    description: 'Liste des fichiers du magnet',
  })
  files: AlldebridMagnetFileDto[];
}

export class AlldebridMagnetStatusResponseDto {
  @ApiProperty({ description: 'Statut de la réponse', example: 'success' })
  status: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: '#/components/schemas/MagnetStatusDto' },
    description: 'Statut des magnets par ID',
  })
  data: {
    magnets: {
      [key: string]: MagnetStatusDto;
    };
  };
}
