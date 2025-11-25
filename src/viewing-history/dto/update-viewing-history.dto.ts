import { IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateViewingHistoryDto {
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

  @ApiProperty({
    description: 'Progression de la lecture (en pourcentage)',
    minimum: 0,
    maximum: 100,
    example: 50,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;
}
