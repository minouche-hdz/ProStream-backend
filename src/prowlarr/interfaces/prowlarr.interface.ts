export type ProwlarrSearchResult = ProwlarrItem[];

export interface ProwlarrIndexer {
  indexerUrls: string[];
  definitionName: string;
}

export interface ProwlarrItem {
  title: string;
  size: number;
  publishDate: string;
  downloadUrl: string;
}
