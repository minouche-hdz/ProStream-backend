import { IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetStreamingLinkDto {
  @ApiProperty({
    description: 'Lien de streaming Alldebrid',
    example: 'https://alldebrid.com/streaming/...',
  })
  @IsString()
  @IsUrl()
  link: string;
}
