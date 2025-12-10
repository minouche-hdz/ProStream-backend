import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'; // Corrected import
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios'; // Import AxiosResponse
import { ProwlarrIndexer, ProwlarrItem } from './interfaces/prowlarr.interface';
import { ProwlarrSearchResultDto } from './dto/prowlarr-responses.dto';

@Injectable()
export class ProwlarrService {
  private readonly PROWLARR_API_KEY: string;
  private readonly PROWLARR_BASE_URL: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.PROWLARR_API_KEY =
      this.configService.get<string>('PROWLARR_API_KEY') ?? ''; // Added nullish coalescing
    this.PROWLARR_BASE_URL =
      this.configService.get<string>('PROWLARR_BASE_URL') ?? ''; // Added nullish coalescing
  }

  async search(query: string): Promise<ProwlarrSearchResultDto> {
    return lastValueFrom(
      this.httpService
        .get(`${this.PROWLARR_BASE_URL}/api/v1/search`, {
          params: {
            apikey: this.PROWLARR_API_KEY,
            query,
          },
        })
        .pipe(
          map((response: AxiosResponse<ProwlarrItem[]>) => {
            if (!response.data || !Array.isArray(response.data)) {
              return { results: [] };
            }
            const filteredResults = response.data.filter(
              (result) => !/iso|dvd/i.test(result.title),
            );
            return { results: filteredResults };
          }),
        ),
    );
  }

  async getIndexers(): Promise<ProwlarrIndexer[]> {
    return lastValueFrom(
      this.httpService
        .get(`${this.PROWLARR_BASE_URL}/api/v1/indexer`, {
          params: {
            apikey: this.PROWLARR_API_KEY,
          },
        })
        .pipe(
          map((response: AxiosResponse<ProwlarrIndexer[]>) => response.data),
        ),
    );
  }
}
