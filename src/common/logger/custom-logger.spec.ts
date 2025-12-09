import { CustomLogger } from './custom-logger';
import { ConsoleLogger } from '@nestjs/common';

describe('CustomLogger', () => {
  let logger: CustomLogger;

  beforeEach(() => {
    logger = new CustomLogger();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should call super methods', () => {
    const logSpy = jest
      .spyOn(ConsoleLogger.prototype, 'log')
      .mockImplementation(() => {});
    const errorSpy = jest
      .spyOn(ConsoleLogger.prototype, 'error')
      .mockImplementation(() => {});
    const warnSpy = jest
      .spyOn(ConsoleLogger.prototype, 'warn')
      .mockImplementation(() => {});
    const debugSpy = jest
      .spyOn(ConsoleLogger.prototype, 'debug')
      .mockImplementation(() => {});
    const verboseSpy = jest
      .spyOn(ConsoleLogger.prototype, 'verbose')
      .mockImplementation(() => {});

    logger.log('test');
    expect(logSpy).toHaveBeenCalledWith('test', undefined);

    logger.error('err', 'stack');
    expect(errorSpy).toHaveBeenCalledWith('err', 'stack', undefined);

    logger.warn('warn');
    expect(warnSpy).toHaveBeenCalledWith('warn', undefined);

    logger.debug('debug');
    expect(debugSpy).toHaveBeenCalledWith('debug', undefined);

    logger.verbose('verbose');
    expect(verboseSpy).toHaveBeenCalledWith('verbose', undefined);
  });
});
