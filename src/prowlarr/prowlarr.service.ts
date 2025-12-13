import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'; // Corrected import
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios'; // Import AxiosResponse
import { ProwlarrIndexer, ProwlarrItem } from './interfaces/prowlarr.interface';
import { ProwlarrSearchResultDto } from './dto/prowlarr-responses.dto';
// import { ProwlarrSearchResultDto } from './dto/prowlarr-responses.dto'; // Removed as it's not directly used here

@Injectable()
export class ProwlarrService {
  private readonly PROWLARR_API_KEY: string;
  private readonly PROWLARR_BASE_URL: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.PROWLARR_API_KEY =
      this.configService.get<string>('PROWLARR_API_KEY') ?? '';
    this.PROWLARR_BASE_URL =
      this.configService.get<string>('PROWLARR_BASE_URL') ?? '';
  }

  async search(query: string): Promise<ProwlarrSearchResultDto> {
    const url = `${this.PROWLARR_BASE_URL}/api/v1/search`;
    const params = {
      apikey: this.PROWLARR_API_KEY,
      query,
    };

    return lastValueFrom(
      this.httpService.get(url, { params }).pipe(
        map((response: AxiosResponse<ProwlarrItem[]>) => {
          if (!response.data || !Array.isArray(response.data)) {
            return { results: [] };
          }

          const rawResults = response.data;
          // Réactiver le filtre pour exclure les résultats contenant 'iso' ou 'dvd'
          const filteredResults = rawResults;
          // Mapper les résultats vers ProwlarrItemDto pour correspondre au DTO Swagger
          const mappedResults = filteredResults.map((item) => ({
            title: item.title,
            size: item.size,
            publishDate: item.publishDate,
            downloadUrl: item.downloadUrl,
            guid: item.guid,
            age: item.age,
            ageHours: item.ageHours,
            ageMinutes: item.ageMinutes,
            grabs: item.grabs,
            indexerId: item.indexerId,
            indexer: item.indexer,
            sortTitle: item.sortTitle,
            imdbId: item.imdbId,
            tmdbId: item.tmdbId,
            tvdbId: item.tvdbId,
            tvMazeId: item.tvMazeId,
            infoUrl: item.infoUrl,
            indexerFlags: item.indexerFlags,
            seeders: item.seeders,
            leechers: item.leechers,
            protocol: item.protocol,
            fileName: item.fileName,
          }));
          return { results: mappedResults };
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
