import { HttpService } from '@nestjs/axios';
import { setupAxiosRetryInterceptor } from './axios-retry.interceptor';
import { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

describe('setupAxiosRetryInterceptor', () => {
  let httpService: HttpService;
  let useSpy: jest.Mock;
  let requestSpy: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
    useSpy = jest.fn();
    requestSpy = jest.fn();
    httpService = {
      axiosRef: {
        interceptors: {
          response: {
            use: useSpy,
          },
        },
        request: requestSpy,
      },
    } as unknown as HttpService;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should register the interceptor', () => {
    setupAxiosRetryInterceptor(httpService);
    expect(useSpy).toHaveBeenCalled();
    // The first arg is success handler (identity), second is error handler
    expect(useSpy.mock.calls[0][0]('test')).toBe('test');
    expect(useSpy.mock.calls[0][1]).toBeInstanceOf(Function);
  });

  describe('interceptor error handler', () => {
    let errorInterceptor: (error: AxiosError) => Promise<any>;

    beforeEach(() => {
      setupAxiosRetryInterceptor(httpService);
      errorInterceptor = useSpy.mock.calls[0][1];
    });

    it('should reject if error has no config', async () => {
      const error = {} as AxiosError;
      await expect(errorInterceptor(error)).rejects.toEqual(error);
    });

    it('should reject if retry attempts exceeded', async () => {
      const error = {
        config: {
          retryAttempts: 3,
          retries: 3,
        } as InternalAxiosRequestConfig,
      } as AxiosError;
      await expect(errorInterceptor(error)).rejects.toEqual(error);
    });

    it('should retry request after delay if retries available', async () => {
      const config = {
        retryAttempts: 0,
        retries: 3,
        retryDelay: 1000,
      } as InternalAxiosRequestConfig;
      const error = { config } as AxiosError;
      const response = { data: 'success' } as AxiosResponse;

      requestSpy.mockResolvedValue(response);

      const promise = errorInterceptor(error);

      // Verify delay
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);

      jest.advanceTimersByTime(1000);

      const result = await promise;

      expect(config.retryAttempts).toBe(1);
      expect(requestSpy).toHaveBeenCalledWith(config);
      expect(result).toEqual(response);
    });

    it('should use default values for attempts and delay', async () => {
      const config = {
        retries: 1,
        // retryAttempts undefined -> 0
        // retryDelay undefined -> 1000 default
      } as InternalAxiosRequestConfig;
      const error = { config } as AxiosError;
      requestSpy.mockResolvedValue({ data: 'ok' });

      const promise = errorInterceptor(error);

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);

      jest.advanceTimersByTime(1000);
      await promise;

      expect(config.retryAttempts).toBe(1);
    });
  });
});
