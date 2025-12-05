import {
  IsNotEmpty,
  IsString,
  IsUrl,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartStreamDto {
  @ApiProperty({
    description: 'URL du fichier MKV à streamer',
    example: 'https://alldebrid.com/movie.mkv',
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  mkvUrl: string;

  @ApiProperty({
    description: 'Temps de départ en secondes (optionnel)',
    example: 120,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  startTime?: number;
}
