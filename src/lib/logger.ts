export class Logger {
  error(message: string, context: Record<string, any> = {}) {
    console.error({
      message,
      ...context,
      timestamp: new Date().toISOString(),
    });
  }

  info(message: string, context: Record<string, any> = {}) {
    console.info({
      message,
      ...context,
      timestamp: new Date().toISOString(),
    });
  }

  warn(message: string, context: Record<string, any> = {}) {
    console.warn({
      message,
      ...context,
      timestamp: new Date().toISOString(),
    });
  }
}
