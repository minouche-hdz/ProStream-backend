import { IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMagnetDto {
  @ApiProperty({
    description: 'URL du fichier torrent ou lien magnet',
    example: 'magnet:?xt=urn:btih:...',
  })
  @IsString()
  @IsUrl()
  downloadUrl: string;
}
