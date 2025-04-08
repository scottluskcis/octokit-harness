// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LoggerFn = (message: string, meta?: any) => unknown;
export interface Logger {
  debug: LoggerFn;
  info: LoggerFn;
  warn: LoggerFn;
  error: LoggerFn;
}

export interface Arguments {
  // context
  orgName: string;

  // octokit
  baseUrl: string;
  proxyUrl: string | undefined;
  pageSize?: number;
  extraPageSize?: number;

  // logging
  verbose: boolean;

  // auth
  accessToken?: string;
  appId?: string | undefined;
  privateKey?: string | undefined;
  privateKeyFile?: string | undefined;
  appInstallationId?: string | undefined;

  // rate limit check
  rateLimitCheckInterval?: number;

  // retry - exponential backoff
  retryMaxAttempts?: number;
  retryInitialDelay?: number;
  retryMaxDelay?: number;
  retryBackoffFactor?: number;
  retrySuccessThreshold?: number;
  retryDisabled?: boolean;

  resumeFromLastSave?: boolean;

  // output
  outputFile?: string;
  outputFileName?: string;

  repoList?: string;
  autoProcessMissing?: boolean;
}

export type AuthResponse = {
  type: string;
  token: string;
  tokenType?: string;
};

export interface RetryState {
  attempt: number;
  successCount: number;
  retryCount: number;
  lastProcessedRepo?: string | null;
  error?: Error;
}

export interface RetryableOperation<T> {
  execute: () => Promise<T>;
  onRetry?: (state: RetryState) => void;
  onSuccess?: (result: T) => void;
  shouldRetry?: (error: Error) => boolean;
}
