import { Test, TestingModule } from '@nestjs/testing';
import { AlldebridService } from './alldebrid.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import axios from 'axios';
import * as crypto from 'crypto';
import {
  AlldebridMagnetUploadResponse,
  AlldebridStreamingLinkResponse,
  AlldebridMagnetFilesResponse,
  AlldebridMagnetStatusResponse,
} from './interfaces/alldebrid.interface';

// Mock axios
jest.mock('axios');

// Mock crypto for sha1 hash
jest.mock('crypto', () => {
  const mockUpdate = jest.fn().mockReturnThis();
  const mockDigest = jest.fn(() => 'mockInfoHash');
  const mockCreateHash = jest.fn(() => ({
    update: mockUpdate,
    digest: mockDigest,
  }));
  return {
    createHash: mockCreateHash,
    _mockUpdate: mockUpdate, // Exposer les mocks pour les assertions
    _mockDigest: mockDigest,
  };
});

// Fonctions bencode pour les tests (copiées du service pour les tester directement)
type BencodeValue =
  | string
  | Buffer
  | number
  | BencodeValue[]
  | { [key: string]: BencodeValue };

function encodeBencode(value: BencodeValue): Buffer {
  if (typeof value === 'string') {
    return Buffer.from(`${value.length}:${value}`);
  } else if (Buffer.isBuffer(value)) {
    return Buffer.concat([Buffer.from(`${value.length}:`), value]);
  } else if (typeof value === 'number') {
    return Buffer.from(`i${value}e`);
  } else if (Array.isArray(value)) {
    const encodedItems = value.map((item) => encodeBencode(item));
    return Buffer.concat([Buffer.from('l'), ...encodedItems, Buffer.from('e')]);
  } else if (typeof value === 'object' && value !== null) {
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

describe('AlldebridService', () => {
  let service: AlldebridService;
  let httpService: HttpService;
  let configService: ConfigService;

  // Déclarer les mocks de crypto pour un typage correct
  const mockedCrypto = crypto as jest.Mocked<typeof crypto> & {
    _mockUpdate: jest.Mock;
    _mockDigest: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlldebridService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'ALLDEBRID_API_KEY') return 'mockAlldebridApiKey';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AlldebridService>(AlldebridService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);

    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
    // Re-mock la fonction get après clearAllMocks pour qu'elle soit prête pour le prochain test
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'ALLDEBRID_API_KEY') return 'mockAlldebridApiKey';
      return null;
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Bencode functions', () => {
    it('should encode a string', () => {
      const encoded = encodeBencode('spam');
      expect(encoded.toString()).toEqual('4:spam');
    });

    it('should decode a string', () => {
      const decoded = decodeBencode(Buffer.from('4:spam'));
      expect(decoded).toEqual(Buffer.from('spam'));
    });

    it('should encode an integer', () => {
      const encoded = encodeBencode(3);
      expect(encoded.toString()).toEqual('i3e');
    });

    it('should decode an integer', () => {
      const decoded = decodeBencode(Buffer.from('i3e'));
      expect(decoded).toEqual(3);
    });

    it('should encode a list', () => {
      const encoded = encodeBencode(['spam', 'eggs']);
      expect(encoded.toString()).toEqual('l4:spam4:eggse');
    });

    it('should decode a list', () => {
      const decoded = decodeBencode(
        Buffer.from('l4:spam4:eggse'),
      ) as BencodeValue[];
      expect(decoded[0]).toEqual(Buffer.from('spam'));
      expect(decoded[1]).toEqual(Buffer.from('eggs'));
    });

    it('should encode a dictionary', () => {
      const encoded = encodeBencode({ cow: 'moo', spam: 'eggs' });
      expect(encoded.toString()).toEqual('d3:cow3:moo4:spam4:eggse');
    });

    it('should decode a dictionary', () => {
      const decoded = decodeBencode(
        Buffer.from('d3:cow3:moo4:spam4:eggse'),
      ) as Record<string, BencodeValue>;
      expect(decoded.cow).toEqual(Buffer.from('moo'));
      expect(decoded.spam).toEqual(Buffer.from('eggs'));
    });

    it('should throw error for unsupported encode type', () => {
      expect(() => encodeBencode(true as unknown as BencodeValue)).toThrow(
        'Unsupported type for bencode encoding',
      );
    });

    it('should throw error for invalid bencode format', () => {
      expect(() => decodeBencode(Buffer.from('xinvalid'))).toThrow(
        'Invalid bencode format',
      );
    });
  });

  describe('urlToMagnet', () => {
    it('should convert a torrent URL to a magnet link', async () => {
      // Un vrai buffer bencode pour un torrent simple
      const mockTorrentBuffer = encodeBencode({
        announce: 'http://example.com/announce',
        info: {
          length: 12345,
          name: Buffer.from('test.txt'),
          'piece length': 16384,
          pieces: Buffer.from('abcdefghijklmnopqrst'),
        },
      });
      jest.spyOn(axios, 'get').mockResolvedValue({ data: mockTorrentBuffer });

      const magnetLink = await service.urlToMagnet(
        'http://example.com/test.torrent',
      );
      expect(magnetLink).toEqual('magnet:?xt=urn:btih:mockInfoHash');
      expect(axios.get).toHaveBeenCalledWith(
        'http://example.com/test.torrent',
        {
          responseType: 'arraybuffer',
        },
      );
      expect(mockedCrypto.createHash).toHaveBeenCalledWith('sha1');
      expect(mockedCrypto._mockUpdate).toHaveBeenCalled();
      expect(mockedCrypto._mockDigest).toHaveBeenCalledWith('hex');
    });

    it('should throw an error if torrent download fails', async () => {
      jest.spyOn(axios, 'get').mockRejectedValue(new Error('Network error'));
      await expect(async () =>
        service.urlToMagnet('http://example.com/bad.torrent'),
      ).rejects.toThrow('Network error');
    });
  });

  describe('addMagnet', () => {
    it('should add a magnet link and return the response', async () => {
      const mockResponse: AlldebridMagnetUploadResponse = {
        status: 'success',
        data: {
          magnets: [
            {
              id: '123',
              hash: 'abc',
              filename: 'test.torrent',
              size: '1000',
              status: 'uploading',
              download_url: 'http://example.com/download',
              files: [],
            },
          ],
        },
      };
      jest.spyOn(httpService, 'get').mockReturnValue(
        of({
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { headers: {} as any },
        }) as any,
      );
      const result = await service.addMagnet('magnet:?xt=urn:btih:mockHash');
      expect(result).toEqual(mockResponse);
      expect(httpService.get).toHaveBeenCalledWith(
        `${(service as any).ALLDEBRID_BASE_URL}/magnet/upload`,
        {
          params: {
            agent: 'ProStream',
            apikey: 'mockAlldebridApiKey',
            magnet: 'magnet:?xt=urn:btih:mockHash',
          },
        },
      );
    });

    it('should throw an error if addMagnet API call fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(async () =>
        service.addMagnet('magnet:?xt=urn:btih:mockHash'),
      ).rejects.toThrow('API error');
    });
  });

  describe('getMagnetStatus', () => {
    it('should get magnet status and return the response', async () => {
      const mockResponse: AlldebridMagnetStatusResponse = {
        status: 'success',
        data: {
          magnets: {
            '123': {
              id: '123',
              filename: 'test.mp4',
              size: 1000,
              hash: 'somehash',
              status: 'ready',
              statusCode: 2,
              uploadDate: 1678886400,
              completionDate: '2023-03-15',
              files: [{ n: 'video.mp4', s: 1000, l: 'http://link.com' }],
            },
          },
        },
      };
      jest.spyOn(httpService, 'get').mockReturnValue(
        of({
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { headers: {} as any },
        }) as any,
      );
      const result = await service.getMagnetStatus('123');
      expect(result).toEqual(mockResponse);
      expect(httpService.get).toHaveBeenCalledWith(
        `${(service as any).ALLDEBRID_BASE_URL}/magnet/status`,
        {
          params: {
            agent: 'ProStream',
            apikey: 'mockAlldebridApiKey',
            id: '123',
          },
        } as any,
      );
    });

    it('should throw an error if getMagnetStatus API call fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(async () => service.getMagnetStatus('123')).rejects.toThrow(
        'API error',
      );
    });
  });

  describe('getStreamingLink', () => {
    it('should get streaming link and return the response', async () => {
      const mockResponse: AlldebridStreamingLinkResponse = {
        status: 'success',
        data: {
          link: 'http://streaming.example.com/video.mp4',
          name: 'video.mp4',
          size: '1000',
          type: 'video',
          streamable: true,
          files: [],
        },
      };
      jest.spyOn(httpService, 'get').mockReturnValue(
        of({
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { headers: {} as any },
        }) as any,
      );
      const result = await service.getStreamingLink(
        'http://alldebrid.com/link',
      );
      expect(result).toEqual(mockResponse);
      expect(httpService.get).toHaveBeenCalledWith(
        `${(service as any).ALLDEBRID_BASE_URL}/link/unlock`,
        {
          params: {
            agent: 'ProStream',
            apikey: 'mockAlldebridApiKey',
            link: 'http://alldebrid.com/link',
          },
        } as any,
      );
    });

    it('should throw an error if getStreamingLink API call fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(async () =>
        service.getStreamingLink('http://alldebrid.com/link'),
      ).rejects.toThrow('API error');
    });
  });

  describe('getMagnetFiles', () => {
    it('should get magnet files and return the response', async () => {
      const mockResponse: AlldebridMagnetFilesResponse = {
        status: 'success',
        data: {
          magnets: [
            {
              id: '123',
              files: [{ n: 'video.mp4', s: 1000, link: 'http://link.com' }],
            },
          ],
        },
      };
      jest.spyOn(httpService, 'post').mockReturnValue(
        of({
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { headers: {} as any },
        }) as any,
      );
      const formData = new FormData();
      formData.append('id[]', '123');

      const result = await service.getMagnetFiles('123');
      expect(result).toEqual(mockResponse);
      expect(httpService.post).toHaveBeenCalledWith(
        `${(service as any).ALLDEBRID_BASE_URL}/magnet/files`,
        expect.any(FormData),
        {
          params: {
            agent: 'ProStream',
            apikey: 'mockAlldebridApiKey',
          },
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        } as any,
      );
    });

    it('should throw an error if getMagnetFiles API call fails', async () => {
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => new Error('API error')));
      await expect(async () => service.getMagnetFiles('123')).rejects.toThrow(
        'API error',
      );
    });
  });
});
