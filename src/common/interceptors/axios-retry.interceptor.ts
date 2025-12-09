import { HttpService } from '@nestjs/axios';
import { firstValueFrom, from } from 'rxjs';
import { AxiosError } from 'axios';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    retryAttempts?: number;
    retries?: number;
    retryDelay?: number;
  }
}

export function setupAxiosRetryInterceptor(httpService: HttpService) {
  httpService.axiosRef.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config;
      // Si la requête n'existe pas ou si nous avons déjà retenté
      if (!config || (config.retryAttempts ?? 0) >= (config.retries ?? 0)) {
        return Promise.reject(error);
      }

      config.retryAttempts = (config.retryAttempts ?? 0) + 1;

      // Attendre avant de retenter
      await new Promise((resolve) =>
        setTimeout(resolve, config.retryDelay ?? 1000),
      );

      return firstValueFrom(from(httpService.axiosRef.request(config)));
    },
  );
}
