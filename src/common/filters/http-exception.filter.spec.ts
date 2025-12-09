import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { Request, Response } from 'express';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockLoggerError: jest.SpyInstance;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockLoggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch an exception and format the response correctly with object body', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockResponse = {
      status: mockStatus,
    } as unknown as Response;

    const mockRequest = {
      url: '/test-url',
    } as unknown as Request;

    const mockArgumentsHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    const exceptionResponse = { message: 'Test error', error: 'Bad Request' };
    const exception = new HttpException(
      exceptionResponse,
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(exceptionResponse);
    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.stringContaining('Http Status: 400'),
      expect.any(String), // stack trace
    );
  });

  it('should catch an exception and format the response correctly with string body', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockResponse = {
      status: mockStatus,
    } as unknown as Response;

    const mockRequest = {
      url: '/test-string-url',
    } as unknown as Request;

    const mockArgumentsHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    const exceptionMessage = 'Forbidden resource';
    const exception = new HttpException(exceptionMessage, HttpStatus.FORBIDDEN);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.FORBIDDEN,
      message: exceptionMessage,
      error: 'HttpException',
    });
    expect(mockLoggerError).toHaveBeenCalled();
  });
});
