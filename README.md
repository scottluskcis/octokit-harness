# Octokit Harness

A flexible wrapper for working with GitHub API using Octokit, providing resilient API interactions with built-in retry mechanisms, authentication handling, and logging.

## Installation

This package is hosted on GitHub Packages. To install it, you'll need to:

1. Create a GitHub Personal Access Token (PAT) with the `read:packages` scope
2. Configure npm to use GitHub Packages for @scottluskcis packages

Create an `.npmrc` file in your project with:

```
@scottluskcis:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then install the package:

```bash
# Export your GitHub token as an environment variable
export GITHUB_TOKEN=your_github_personal_access_token

# Install the package
npm install @scottluskcis/octokit-harness
```

Alternatively, you can pass the token directly during installation:

```bash
npm install @scottluskcis/octokit-harness --registry=https://npm.pkg.github.com/ --auth-token=your_github_personal_access_token
```

## Features

- **GitHub App and PAT authentication** - Supports both GitHub App installation tokens and Personal Access Tokens
- **Automatic retry with exponential backoff** - Built-in resilience for API operations
- **Configurable logging** - Detailed logging system based on Winston
- **Rate limit handling** - Intelligent throttling and rate limit management
- **Environment-based configuration** - Easy setup via environment variables or direct options

## Usage

### Basic Example

```typescript
import {
  executeWithOctokit,
  getOptsFromEnv,
} from '@scottluskcis/octokit-harness';

// Load config from environment variables (.env file)
const config = getOptsFromEnv();

// Execute operations with automatic retry handling
await executeWithOctokit(config, async ({ octokit, logger }) => {
  logger.info('Fetching repository data...');

  const { data: repo } = await octokit.rest.repos.get({
    owner: config.orgName,
    repo: 'my-repository',
  });

  logger.info(`Retrieved repository: ${repo.name}`);
  return repo;
});
```

### Authentication Configuration

The package supports both GitHub App authentication and Personal Access Tokens:

```typescript
// Using GitHub App authentication (via environment variables)
// Set in .env file:
// APP_ID=123456
// PRIVATE_KEY_FILE=keys/private-key.pem
// APP_INSTALLATION_ID=987654

// Using Personal Access Token (via environment variables)
// Set in .env file:
// ACCESS_TOKEN=ghp_xxxxxxxxxxxx
```

### Custom Initialization

If you need more control over initialization:

```typescript
import {
  init_logger,
  init_octokit,
  withRetry,
} from '@scottluskcis/octokit-harness';

// Initialize just the logger
const logger = await init_logger(true, 'custom-prefix');

// Initialize just the Octokit client
const { octokit } = await init_octokit({
  orgName: 'my-organization',
  baseUrl: 'https://api.github.com',
  verbose: true,
  appId: '123456',
  privateKeyFile: 'path/to/key.pem',
  appInstallationId: '987654',
});

// Use retry mechanism directly
const result = await withRetry(
  async () => {
    // API operation that might fail
    return await octokit.rest.repos.listForOrg({ org: 'my-organization' });
  },
  {
    maxAttempts: 5,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffFactor: 2,
  },
  (state) => {
    logger.warn(`Retrying operation, attempt ${state.attempt}`, {
      error: state.error?.message,
    });
  },
);
```

## Configuration Options

| Option                  | Environment Variable      | Description                                                    |
| ----------------------- | ------------------------- | -------------------------------------------------------------- |
| `orgName`               | `ORG_NAME`                | GitHub organization name                                       |
| `baseUrl`               | `BASE_URL`                | GitHub API URL (defaults to `https://api.github.com`)          |
| `proxyUrl`              | `PROXY_URL`               | Optional proxy URL for API requests                            |
| `verbose`               | `VERBOSE`                 | Enable verbose logging (`true`/`false`)                        |
| `accessToken`           | `ACCESS_TOKEN`            | GitHub personal access token                                   |
| `appId`                 | `APP_ID`                  | GitHub App ID                                                  |
| `privateKey`            | `PRIVATE_KEY`             | GitHub App private key contents                                |
| `privateKeyFile`        | `PRIVATE_KEY_FILE`        | Path to GitHub App private key file                            |
| `appInstallationId`     | `APP_INSTALLATION_ID`     | GitHub App installation ID                                     |
| `retryMaxAttempts`      | `RETRY_MAX_ATTEMPTS`      | Maximum retry attempts (default: 3)                            |
| `retryInitialDelay`     | `RETRY_INITIAL_DELAY`     | Initial retry delay in ms (default: 1000)                      |
| `retryMaxDelay`         | `RETRY_MAX_DELAY`         | Maximum retry delay in ms (default: 30000)                     |
| `retryBackoffFactor`    | `RETRY_BACKOFF_FACTOR`    | Exponential backoff factor (default: 2)                        |
| `retrySuccessThreshold` | `RETRY_SUCCESS_THRESHOLD` | Successful operations needed to reset retry count (default: 5) |

## API Reference

### Main Functions

- **`executeWithOctokit(options, callback)`**: Executes operations with initialized Octokit client and automatic retry
- **`getOptsFromEnv()`**: Loads configuration options from environment variables
- **`init_client(options)`**: Initializes both logger and Octokit client
- **`init_logger(verbose, logFilePrefix?)`**: Initializes just the logger
- **`init_octokit(options)`**: Initializes just the Octokit client
- **`withRetry(operation, config, onRetry?)`**: Implements retry mechanism with exponential backoff

### Types

- **`Arguments`**: Configuration options for the package
- **`Logger`**: Winston-based logger interface
- **`RetryConfig`**: Configuration for retry mechanism
- **`RetryState`**: Current state of retry operation

## License

MIT
