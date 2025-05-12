type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMessage {
  message: string;
  data?: any;
  timestamp: string;
  level: LogLevel;
}

class Logger {
  private static instance: Logger;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, data?: any) {
    const logMessage: LogMessage = {
      message,
      data,
      timestamp: new Date().toISOString(),
      level,
    };

    switch (level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      case 'debug':
        console.debug(logMessage);
        break;
    }
  }

  public info(message: string, data?: any) {
    this.log('info', message, data);
  }

  public warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  public error(message: string, data?: any) {
    this.log('error', message, data);
  }

  public debug(message: string, data?: any) {
    this.log('debug', message, data);
  }
}

export default Logger.getInstance();
