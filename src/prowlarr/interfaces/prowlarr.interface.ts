export interface ProwlarrSearchResult {
  results: ProwlarrItem[];
}

export interface ProwlarrIndexer {
  indexerUrls: string[];
  definitionName: string;
}

interface ProwlarrItem {
  title: string;
  size: number;
  publishDate: string;
  downloadUrl: string;
}
