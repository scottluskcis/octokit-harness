import { config } from 'dotenv';
import { Arguments } from './types.js';

// Load environment variables from .env file
config();

/**
 * Gets configuration from environment variables
 * @returns Configuration object based on environment variables
 */
export function getOptsFromEnv(): Arguments {
  return {
    // Organization settings
    orgName: process.env.ORG_NAME || '',

    // Octokit settings
    baseUrl: process.env.BASE_URL || 'https://api.github.com',
    proxyUrl: process.env.PROXY_URL,
    pageSize: parseInt(process.env.PAGE_SIZE || '10'),
    extraPageSize: parseInt(process.env.EXTRA_PAGE_SIZE || '50'),

    // Logger settings
    verbose: process.env.VERBOSE === 'true',

    // Authentication settings
    accessToken: process.env.ACCESS_TOKEN,
    appId: process.env.APP_ID,
    privateKey: process.env.PRIVATE_KEY,
    privateKeyFile: process.env.PRIVATE_KEY_FILE,
    appInstallationId: process.env.APP_INSTALLATION_ID,

    // Rate limiting settings
    rateLimitCheckInterval: parseInt(
      process.env.RATE_LIMIT_CHECK_INTERVAL || '25',
    ),

    // Retry settings
    retryMaxAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS || '3'),
    retryInitialDelay: parseInt(process.env.RETRY_INITIAL_DELAY || '1000'),
    retryMaxDelay: parseInt(process.env.RETRY_MAX_DELAY || '30000'),
    retryBackoffFactor: parseFloat(process.env.RETRY_BACKOFF_FACTOR || '2'),
    retrySuccessThreshold: parseInt(process.env.RETRY_SUCCESS_THRESHOLD || '5'),

    // Resume option
    resumeFromLastSave: process.env.RESUME_FROM_LAST_SAVE === 'true',

    // Output options
    outputFile: process.env.OUTPUT_FILE,

    // Repository settings
    repoList: process.env.REPO_LIST,
    autoProcessMissing: process.env.AUTO_PROCESS_MISSING === 'true',
  };
}
