import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'; // Corrected import
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as fs from 'fs';
// import * as path from 'path'; // path is not used, but kept for now

@Injectable()
export class StreamingService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  streamFile(filePath: string, res: Response): void {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = res.req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4', // Ou le type de fichier approprié
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4', // Ou le type de fichier approprié
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  }
}
