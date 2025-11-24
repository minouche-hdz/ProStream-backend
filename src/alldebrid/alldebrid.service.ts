import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, map } from 'rxjs';
import {
  AlldebridMagnetUploadResponse,
  AlldebridStreamingLinkResponse,
  AlldebridMagnetFilesResponse,
  AlldebridMagnetStatusResponse,
} from './interfaces/alldebrid.interface';
import axios from 'axios';
import * as crypto from 'crypto';

type BencodeValue =
  | string
  | Buffer
  | number
  | BencodeValue[]
  | { [key: string]: BencodeValue | undefined }; // Ajout de 'undefined' ici pour les propriétés optionnelles

interface TorrentInfo extends Record<string, BencodeValue | undefined> {
  name: Buffer;
  'piece length': number;
  pieces: Buffer;
}

interface Torrent extends Record<string, BencodeValue | undefined> {
  info: TorrentInfo;
  'announce-list'?: string[][];
  announce?: string | string[];
}

@Injectable()
export class AlldebridService {
  private readonly ALLDEBRID_API_KEY: string;
  private readonly ALLDEBRID_BASE_URL: string =
    'https://api.alldebrid.com/v4.1';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.ALLDEBRID_API_KEY =
      this.configService.get<string>('ALLDEBRID_API_KEY') ?? '';
  }

  async urlToMagnet(downloadUrl: string): Promise<string> {
    const response = await axios.get(downloadUrl, {
      responseType: 'arraybuffer',
    });
    const torrentBuffer = Buffer.from(response.data as ArrayBufferLike);
    const torrent = decodeBencode(torrentBuffer) as Torrent;
    const info = torrent.info;
    const infoBuffer = encodeBencode(info);
    const infoHash = crypto.createHash('sha1').update(infoBuffer).digest('hex');
    return `magnet:?xt=urn:btih:${infoHash}`;
  }

  async addMagnet(magnetLink: string): Promise<AlldebridMagnetUploadResponse> {
    return firstValueFrom(
      this.httpService
        .get<AlldebridMagnetUploadResponse>(
          `${this.ALLDEBRID_BASE_URL}/magnet/upload`,
          {
            params: {
              agent: 'ProStream',
              apikey: this.ALLDEBRID_API_KEY,
              magnet: magnetLink,
            },
          },
        )
        .pipe(map((response) => response.data)),
    );
  }

  async getMagnetStatus(
    magnetId: string,
  ): Promise<AlldebridMagnetStatusResponse> {
    return firstValueFrom(
      this.httpService
        .get<AlldebridMagnetStatusResponse>(
          `${this.ALLDEBRID_BASE_URL}/magnet/status`,
          {
            params: {
              agent: 'ProStream',
              apikey: this.ALLDEBRID_API_KEY,
              id: magnetId,
            },
          },
        )
        .pipe(map((response) => response.data)),
    );
  }

  async getStreamingLink(
    link: string,
  ): Promise<AlldebridStreamingLinkResponse> {
    return firstValueFrom(
      this.httpService
        .get<AlldebridStreamingLinkResponse>(
          `${this.ALLDEBRID_BASE_URL}/link/unlock`,
          {
            params: {
              agent: 'ProStream',
              apikey: this.ALLDEBRID_API_KEY,
              link,
            },
          },
        )
        .pipe(map((response) => response.data)),
    );
  }

  async getMagnetFiles(
    magnetId: string,
  ): Promise<AlldebridMagnetFilesResponse> {
    const formData = new FormData();
    formData.append('id[]', magnetId);
    return firstValueFrom(
      this.httpService
        .post<AlldebridMagnetFilesResponse>(
          `${this.ALLDEBRID_BASE_URL}/magnet/files`,
          formData,
          {
            params: {
              agent: 'ProStream',
              apikey: this.ALLDEBRID_API_KEY,
            },
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        )
        .pipe(map((response) => response.data)),
    );
  }
}
function encodeBencode(value: BencodeValue): Buffer {
  if (typeof value === 'string') {
    return Buffer.from(`${value.length}:${value}`);
  } else if (Buffer.isBuffer(value)) {
    return Buffer.concat([Buffer.from(`${value.length}:`), value]);
  } else if (typeof value === 'number') {
    return Buffer.from(`i${value}e`);
  } else if (Array.isArray(value)) {
    const encodedItems = value.map(encodeBencode);
    return Buffer.concat([Buffer.from('l'), ...encodedItems, Buffer.from('e')]);
  } else if (typeof value === 'object' && value !== null) {
    // Handle TorrentInfo specifically
    if (
      'name' in value &&
      'piece length' in value &&
      'pieces' in value &&
      typeof (value as TorrentInfo).name === 'object' &&
      Buffer.isBuffer((value as TorrentInfo).name) &&
      typeof (value as TorrentInfo)['piece length'] === 'number' &&
      typeof (value as TorrentInfo).pieces === 'object' &&
      Buffer.isBuffer((value as TorrentInfo).pieces)
    ) {
      const infoKeys = ['piece length', 'pieces', 'name'].sort(); // Order matters for info hash
      const encodedInfoItems = infoKeys.flatMap((key) => [
        encodeBencode(key),
        encodeBencode((value as TorrentInfo)[key] as BencodeValue), // Cast to BencodeValue
      ]);
      return Buffer.concat([
        Buffer.from('d'),
        ...encodedInfoItems,
        Buffer.from('e'),
      ]);
    }

    const keys = Object.keys(value).sort();
    const encodedItems = keys.flatMap((key) => [
      encodeBencode(key),
      encodeBencode((value as { [key: string]: BencodeValue })[key]),
    ]);
    return Buffer.concat([Buffer.from('d'), ...encodedItems, Buffer.from('e')]);
  }
  throw new Error('Unsupported type for bencode encoding');
}

function decodeBencode(buffer: Buffer): BencodeValue {
  let offset = 0;

  const decodeString = (): Buffer => {
    const colonIndex = buffer.indexOf(':', offset);
    if (colonIndex === -1)
      throw new Error(
        'Invalid bencode format: missing colon for string length',
      );
    const length = parseInt(buffer.toString('ascii', offset, colonIndex), 10);
    if (isNaN(length) || colonIndex + 1 + length > buffer.length)
      throw new Error('Invalid bencode format: invalid string length');
    offset = colonIndex + 1;
    const str = buffer.slice(offset, offset + length);
    offset += length;
    return str;
  };

  const decodeInteger = (): number => {
    const endIndex = buffer.indexOf('e', offset);
    if (endIndex === -1)
      throw new Error('Invalid bencode format: missing "e" for integer');
    const intStr = buffer.toString('ascii', offset + 1, endIndex);
    offset = endIndex + 1;
    const num = parseInt(intStr, 10);
    if (isNaN(num))
      throw new Error('Invalid bencode format: invalid integer value');
    return num;
  };

  const decodeList = (): BencodeValue[] => {
    const list: BencodeValue[] = [];
    offset++; // skip 'l'
    while (buffer.toString('ascii', offset, offset + 1) !== 'e') {
      list.push(decodeNext());
    }
    offset++; // skip 'e'
    return list;
  };

  const decodeDictionary = (): { [key: string]: BencodeValue } => {
    const dict: { [key: string]: BencodeValue } = {};
    offset++; // skip 'd'
    while (buffer.toString('ascii', offset, offset + 1) !== 'e') {
      const key = decodeString().toString();
      dict[key] = decodeNext();
    }
    offset++; // skip 'e'
    return dict;
  };

  const decodeNext = (): BencodeValue => {
    const char = buffer.toString('ascii', offset, offset + 1);
    if (char === 'i') {
      return decodeInteger();
    } else if (char === 'l') {
      return decodeList();
    } else if (char === 'd') {
      return decodeDictionary();
    } else if (char >= '0' && char <= '9') {
      return decodeString();
    }
    throw new Error('Invalid bencode format');
  };

  return decodeNext();
}
