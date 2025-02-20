export type Environment = 'development' | 'production';

interface EnvironmentConfig {
  showDevelopmentFeatures: boolean;
  enableControlAnalysis: boolean;
  showImplementationDetails: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

const configurations: Record<Environment, EnvironmentConfig> = {
  development: {
    showDevelopmentFeatures: true,
    enableControlAnalysis: true,
    showImplementationDetails: true,
    logLevel: 'debug'
  },
  production: {
    showDevelopmentFeatures: false,
    enableControlAnalysis: false,
    showImplementationDetails: false,
    logLevel: 'error'
  }
};

export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private currentEnvironment: Environment;

  private constructor() {
    // Default to production unless explicitly set to development
    this.currentEnvironment = 
      process.env.NEXT_PUBLIC_ENV === 'development' ? 'development' : 'production';
  }

  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  public getConfig(): EnvironmentConfig {
    return configurations[this.currentEnvironment];
  }

  public isDevelopment(): boolean {
    return this.currentEnvironment === 'development';
  }

  // Only allow environment override in development
  public setEnvironment(env: Environment): void {
    if (process.env.NODE_ENV === 'development') {
      this.currentEnvironment = env;
    }
  }
}
