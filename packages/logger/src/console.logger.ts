import { Logger, LogLevel } from './interface';
import { clc, isPlainObject, yellow } from '@andyvo/utils';

const DEFAULT_LOG_LEVELS: LogLevel[] = [
  'log',
  'error',
  'warn',
  'debug',
  'verbose',
];

export class ConsoleLogger implements Logger {
  private originalContext?: string;

  constructor(
    protected context?: string,
    protected options: ConsoleLoggerOptions = {},
  ) {
    if (!options.logLevels) {
      options.logLevels = DEFAULT_LOG_LEVELS;
    }
    if (context) {
      this.originalContext = context;
    }
  }

  resetContext() {
    this.context = this.originalContext;
  }

  protected getTimestamp(): string {
    const localeStringOptions = {
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      day: '2-digit',
      month: '2-digit',
    };
    return new Date(Date.now()).toLocaleString(
      undefined,
      localeStringOptions as Intl.DateTimeFormatOptions,
    );
  }

  protected printMessages(
    messages: unknown[],
    context = '',
    logLevel: LogLevel = 'log',
    writeStreamType?: 'stdout' | 'stderr',
  ) {
    const color = this.getColorByLogLevel(logLevel);
    messages.forEach(message => {
      const output = isPlainObject(message)
        ? `${color('Object:')}\n${JSON.stringify(
            message,
            (key, value) =>
              typeof value === 'bigint' ? value.toString() : value,
            2,
          )}\n`
        : color(message as string);

      const pidMessage = color(`[Nest] ${process.pid}  - `);
      const contextMessage = context ? yellow(`[${context}] `) : '';
      const timestampDiff = this.updateAndGetTimestampDiff();
      const formattedLogLevel = color(logLevel.toUpperCase().padStart(7, ' '));
      const computedMessage = `${pidMessage}${this.getTimestamp()} ${formattedLogLevel} ${contextMessage}${output}${timestampDiff}\n`;

      process[writeStreamType ?? 'stdout'].write(computedMessage);
    });
  }

  private updateAndGetTimestampDiff(): string {
    const includeTimestamp =
      ConsoleLogger.lastTimestampAt && this.options?.timestamp;
    const result = includeTimestamp
      ? yellow(` +${Date.now() - ConsoleLogger.lastTimestampAt}ms`)
      : '';
    ConsoleLogger.lastTimestampAt = Date.now();
    return result;
  }

  private getColorByLogLevel(level: LogLevel) {
    switch (level) {
      case 'debug':
        return clc.magentaBright;
      case 'warn':
        return clc.yellow;
      case 'error':
        return clc.red;
      case 'verbose':
        return clc.cyanBright;
      default:
        return clc.green;
    }
  }
}
