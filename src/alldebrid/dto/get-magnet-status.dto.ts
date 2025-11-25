import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetMagnetStatusDto {
  @ApiProperty({
    description: 'ID du magnet Alldebrid',
    example: '1234567890abcdef12345678',
  })
  @IsString()
  magnetId: string;
}
