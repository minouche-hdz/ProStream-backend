export interface AlldebridMagnetUploadResponse {
  status: string;
  data: {
    magnets: {
      id: string;
      filename: string;
      size: string;
      hash: string;
      status: string;
      download_url: string;
      files: any[]; // Vous pouvez affiner cette interface si nécessaire
    }[];
  };
}

export interface AlldebridMagnetFilesResponse {
  status: string;
  data: {
    magnets: {
      id: string;
      files: {
        n: string;
        s: number;
        link: string;
      }[];
    }[];
  };
}

export interface AlldebridStreamingLinkResponse {
  status: string;
  data: {
    link: string;
    name: string;
    size: string;
    type: string;
    streamable: boolean;
    files: any[]; // Vous pouvez affiner cette interface si nécessaire
  };
}

export interface MagnetStatus {
  id: string;
  filename: string;
  size: number;
  hash: string;
  status: string;
  statusCode: number;
  uploadDate: number;
  completionDate: string;
  files: {
    n: string;
    s: number;
    l: string;
  }[];
}

export interface AlldebridMagnetStatusResponse {
  status: string;
  data: {
    magnets: {
      [key: string]: MagnetStatus;
    };
  };
}
