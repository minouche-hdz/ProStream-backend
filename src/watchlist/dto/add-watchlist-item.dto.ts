import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddWatchlistItemDto {
  @ApiProperty({
    description: 'ID TMDB du média',
    example: 12345,
  })
  @IsNumber()
  tmdbId: number;

  @ApiProperty({
    description: 'Type de média (movie, tv)',
    example: 'movie',
  })
  @IsString()
  mediaType: string;

  @ApiProperty({
    description: 'Titre du média',
    example: 'Nom du film/série',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: "Chemin de l'affiche du média",
    example: '/poster.jpg',
  })
  @IsString()
  posterPath: string;
}
