import { init_octokit } from './init.js';
import { withRetry, RetryState } from './retry.js';
import { Arguments, Logger } from './types.js';
import { OctokitExecutionContext } from './octokit.js';

/**
 * Executes GitHub operations with Octokit client in a resilient manner
 * Provides initialized Octokit client and logger to the callback function
 * Handles retries automatically according to configured parameters
 *
 * @param opts Arguments for initializing the Octokit client
 * @param callback Function to execute with initialized logger and octokit instances
 * @returns Result of the callback execution
 */
export async function executeWithOctokit<T>(
  opts: Arguments,
  callback: (context: OctokitExecutionContext) => Promise<T>,
): Promise<T> {
  // Configure retry options from the provided arguments
  const retryConfig = {
    maxAttempts: opts.retryMaxAttempts || 5,
    initialDelayMs: opts.retryInitialDelay || 1000,
    maxDelayMs: opts.retryMaxDelay || 30000,
    backoffFactor: opts.retryBackoffFactor || 2,
    successThreshold: opts.retrySuccessThreshold || 5,
  };

  let logger: Logger | undefined;

  // Define the operation to retry
  const operation = async (): Promise<T> => {
    // Initialize octokit and logger
    const clients = await init_octokit(opts);
    logger = clients.logger;

    // Execute the callback with the initialized clients
    return await callback(clients);
  };

  // Define retry handler
  const onRetry = (state: RetryState) => {
    if (logger) {
      logger.warn(`Operation failed (attempt ${state.attempt}), retrying...`, {
        retryCount: state.retryCount,
        successCount: state.successCount,
        error: state.error?.message,
      });
    }
  };

  // Execute the operation with retry
  return await withRetry(operation, retryConfig, onRetry);
}
