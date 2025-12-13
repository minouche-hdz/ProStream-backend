export interface ProwlarrSearchResult {
  results: ProwlarrItem[];
}

export interface ProwlarrIndexer {
  indexerUrls: string[];
  definitionName: string;
}

export interface ProwlarrItem {
  title: string;
  size: number;
  publishDate: string;
  downloadUrl: string;
  guid: string;
  age: number;
  ageHours: number;
  ageMinutes: number;
  grabs: number;
  indexerId: number;
  indexer: string;
  sortTitle: string;
  imdbId: number;
  tmdbId: number;
  tvdbId: number;
  tvMazeId: number;
  infoUrl: string;
  indexerFlags: string[];
  seeders: number;
  leechers: number;
  protocol: string;
  fileName: string;
}
