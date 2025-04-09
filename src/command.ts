import { Command, Option } from 'commander';
import { parseFloatOption, parseIntOption } from './utils.js';
import { OctokitExecutionContext } from './octokit.js';
import { executeWithOctokit } from './run.js';
import { Arguments } from './types.js';

/**
 * Option configuration for command options
 */
export interface CommandOptionConfig {
  /** Whether the option is mandatory */
  mandatory?: boolean;
  /** Default value for the option */
  defaultValue?: string;
  /** Custom parser function for the option */
  parser?: (value: string) => any;
  /** Whether to hide this option from help */
  hidden?: boolean;
}

/**
 * Common option configuration map
 */
export interface CommonOptionsConfig {
  [key: string]: CommandOptionConfig | boolean;
}

/**
 * Interface for option definition structure
 */
interface OptionDefinition {
  option: Option;
  config: CommandOptionConfig;
}

/**
 * Interface for all options map with index signature
 */
interface AllOptionsMap {
  [key: string]: OptionDefinition;
}

/**
 * Creates a base command with common options that all commands can inherit
 * @param name The name of the command
 * @param description The description of the command
 * @param optionsConfig Configuration for which options to include and their settings
 * @returns A Command instance with common options
 */
export function createBaseCommand({
  name,
  description,
  optionsConfig,
  version,
}: {
  name: string;
  description?: string;
  optionsConfig?: CommonOptionsConfig;
  version?: string;
}): Command {
  const command = new Command();

  command
    .name(name)
    .description(description || `Command to ${name}`)
    .version(version || '1.0.0');

  // Define all possible common options
  const allOptions: AllOptionsMap = {
    orgName: {
      option: new Option(
        '-o, --org-name <org>',
        'The name of the organization to process',
      ).env('ORG_NAME'),
      config: {} as CommandOptionConfig,
    },
    accessToken: {
      option: new Option(
        '-t, --access-token <token>',
        'GitHub access token',
      ).env('ACCESS_TOKEN'),
      config: {} as CommandOptionConfig,
    },
    baseUrl: {
      option: new Option('-u, --base-url <url>', 'GitHub API base URL')
        .env('BASE_URL')
        .default('https://api.github.com'),
      config: { defaultValue: 'https://api.github.com' },
    },
    proxyUrl: {
      option: new Option('--proxy-url <url>', 'Proxy URL if required').env(
        'PROXY_URL',
      ),
      config: {},
    },
    verbose: {
      option: new Option('-v, --verbose', 'Enable verbose logging').env(
        'VERBOSE',
      ),
      config: {},
    },
    appId: {
      option: new Option('--app-id <id>', 'GitHub App ID').env('APP_ID'),
      config: {},
    },
    privateKey: {
      option: new Option('--private-key <key>', 'GitHub App private key').env(
        'PRIVATE_KEY',
      ),
      config: {},
    },
    privateKeyFile: {
      option: new Option(
        '--private-key-file <file>',
        'Path to GitHub App private key file',
      ).env('PRIVATE_KEY_FILE'),
      config: {},
    },
    appInstallationId: {
      option: new Option(
        '--app-installation-id <id>',
        'GitHub App installation ID',
      ).env('APP_INSTALLATION_ID'),
      config: {},
    },
    pageSize: {
      option: new Option('--page-size <size>', 'Number of items per page')
        .env('PAGE_SIZE')
        .default('10')
        .argParser(parseIntOption),
      config: { defaultValue: '10', parser: parseIntOption },
    },
    extraPageSize: {
      option: new Option('--extra-page-size <size>', 'Extra page size')
        .env('EXTRA_PAGE_SIZE')
        .default('50')
        .argParser(parseIntOption),
      config: { defaultValue: '50', parser: parseIntOption },
    },
    rateLimitCheckInterval: {
      option: new Option(
        '--rate-limit-check-interval <seconds>',
        'Interval for rate limit checks in seconds',
      )
        .env('RATE_LIMIT_CHECK_INTERVAL')
        .default('25')
        .argParser(parseIntOption),
      config: { defaultValue: '25', parser: parseIntOption },
    },
    retryMaxAttempts: {
      option: new Option(
        '--retry-max-attempts <attempts>',
        'Maximum number of retry attempts',
      )
        .env('RETRY_MAX_ATTEMPTS')
        .default('3')
        .argParser(parseIntOption),
      config: { defaultValue: '3', parser: parseIntOption },
    },
    retryInitialDelay: {
      option: new Option(
        '--retry-initial-delay <milliseconds>',
        'Initial delay for retry in milliseconds',
      )
        .env('RETRY_INITIAL_DELAY')
        .default('1000')
        .argParser(parseIntOption),
      config: { defaultValue: '1000', parser: parseIntOption },
    },
    retryMaxDelay: {
      option: new Option(
        '--retry-max-delay <milliseconds>',
        'Maximum delay for retry in milliseconds',
      )
        .env('RETRY_MAX_DELAY')
        .default('30000')
        .argParser(parseIntOption),
      config: { defaultValue: '30000', parser: parseIntOption },
    },
    retryBackoffFactor: {
      option: new Option(
        '--retry-backoff-factor <factor>',
        'Backoff factor for retry delays',
      )
        .env('RETRY_BACKOFF_FACTOR')
        .default('2')
        .argParser(parseFloatOption),
      config: { defaultValue: '2', parser: parseFloatOption },
    },
    retrySuccessThreshold: {
      option: new Option(
        '--retry-success-threshold <count>',
        'Number of successful operations before resetting retry count',
      )
        .env('RETRY_SUCCESS_THRESHOLD')
        .default('5')
        .argParser(parseIntOption),
      config: { defaultValue: '5', parser: parseIntOption },
    },
    retryDisabled: {
      option: new Option(
        '--retry-disabled',
        'Disable retry mechanism completely',
      ).env('RETRY_DISABLED'),
      config: {},
    },
    resumeFromLastSave: {
      option: new Option(
        '--resume-from-last-save',
        'Resume from the last saved state',
      ).env('RESUME_FROM_LAST_SAVE'),
      config: {},
    },
    outputFile: {
      option: new Option(
        '--output-file <file>',
        'Path to file for output data',
      ).env('OUTPUT_FILE'),
      config: {},
    },
    outputFileName: {
      option: new Option(
        '-f, --output-file-name <file>',
        'Name of the output file',
      ).env('OUTPUT_FILE_NAME'),
      config: {},
    },
    repoList: {
      option: new Option(
        '--repo-list <file>',
        'Path to file containing list of repositories to process (format: owner/repo_name)',
      ).env('REPO_LIST'),
      config: {},
    },
    autoProcessMissing: {
      option: new Option(
        '--auto-process-missing',
        'Automatically process any missing repositories when main processing is complete',
      ).env('AUTO_PROCESS_MISSING'),
      config: {},
    },
  };

  // Apply custom configurations from optionsConfig
  if (optionsConfig) {
    Object.entries(optionsConfig).forEach(([key, config]) => {
      if (allOptions[key]) {
        // If config is just a boolean true, include with default settings
        if (typeof config === 'boolean' && config === true) {
          // No changes to default config
        } else if (typeof config === 'object') {
          // Apply custom config
          allOptions[key].config = { ...allOptions[key].config, ...config };
        }
      }
    });
  } else {
    // If no optionsConfig provided, include all options with default settings
    Object.keys(allOptions).forEach((key) => {
      optionsConfig = optionsConfig || {};
      optionsConfig[key] = true;
    });
  }

  // Add options to command based on config
  Object.entries(allOptions).forEach(([key, { option, config }]) => {
    if (
      optionsConfig &&
      (optionsConfig[key] === true || typeof optionsConfig[key] === 'object')
    ) {
      // Apply configuration to option
      if (config.mandatory) {
        option.makeOptionMandatory(true);
      }

      // Add the option to the command
      command.addOption(option);
    }
  });

  return command;
}

/**
 * Type definition for an Octokit command action callback
 */
export type OctokitCommandAction<T = any> = (
  context: OctokitExecutionContext,
) => Promise<T>;

/**
 * Creates a base command with Octokit integration that handles the setup automatically
 * @param name The name of the command
 * @param description The description of the command
 * @param action The action callback that receives the Octokit execution context
 * @param optionsConfig Configuration for which options to include and their settings
 * @returns A Command instance with common options and Octokit integration
 */
export function createBaseOctokitCommand({
  name,
  description,
  action,
  optionsConfig,
  version,
}: {
  name: string;
  description?: string;
  action: OctokitCommandAction;
  optionsConfig?: CommonOptionsConfig;
  version?: string;
}): Command {
  // Create base command with all the common options
  const command = createBaseCommand({
    name,
    description,
    optionsConfig,
    version,
  });

  // Set the action to automatically handle Octokit setup
  command.action(async (options: Arguments) => {
    await executeWithOctokit(options, action);
  });

  return command;
}

/**
 * Creates a CLI program with a default command and any subcommands
 * @param programName Name of the program
 * @param description Description of the program
 * @param commands Array of commands to add to the program
 * @returns A configured commander program
 */
export function createProgram({
  name,
  description,
  commands,
  version,
}: {
  name: string;
  description?: string;
  commands: Command[];
  version?: string;
}): Command {
  const program = new Command();

  program
    .name(name)
    .description(description || `${name} program`)
    .version(version || '1.0.0');

  // Add all provided commands
  if (commands && commands.length > 0) {
    commands.forEach((cmd) => program.addCommand(cmd));
  }

  return program;
}
