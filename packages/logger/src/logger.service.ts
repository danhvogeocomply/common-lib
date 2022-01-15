import { Logger, LogLevel } from './interface';

export class LoggerService implements Logger {
  protected localInstanceRef?: LoggerService;
  protected static logLevels?: LogLevel[];

  constructor(
    protected context?: string,
    protected options: { timestamp?: boolean } = {},
  ) {}
}
