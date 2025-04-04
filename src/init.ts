import { createAuthConfig } from "./auth.js";
import { createLogger } from "./logger.js";
import { createOctokit } from "./octokit.js";
import { Arguments, Logger } from "./types.js";
import { Octokit } from "octokit";

/**
 * Initialize the Octokit client and logger
 */
export const init_client = async (
  opts: Arguments
): Promise<{
  logger: Logger;
  octokit: Octokit;
}> => {
  const logFileName = `${opts.orgName}-repo-stats-${
    new Date().toISOString().split("T")[0]
  }.log`;

  const logger = await createLogger(opts.verbose, logFileName);
  const authConfig = createAuthConfig({ ...opts, logger: logger });

  const octokit = createOctokit(
    authConfig,
    opts.baseUrl,
    opts.proxyUrl,
    logger
  );

  return { logger, octokit };
};

/**
 * Initialize just the logger
 */
export const init_logger = async (
  verbose: boolean,
  logFilePrefix?: string
): Promise<Logger> => {
  const logFileName = logFilePrefix
    ? `${logFilePrefix}-${new Date().toISOString().split("T")[0]}.log`
    : undefined;

  return await createLogger(verbose, logFileName);
};

/**
 * Initialize a custom Octokit client
 */
export const init_octokit = async (
  opts: Arguments
): Promise<{
  logger: Logger;
  octokit: Octokit;
}> => {
  const logger = await init_logger(opts.verbose, opts.orgName);
  const authConfig = createAuthConfig({ ...opts, logger });

  const octokit = createOctokit(
    authConfig,
    opts.baseUrl,
    opts.proxyUrl,
    logger
  );

  return { logger, octokit };
};
