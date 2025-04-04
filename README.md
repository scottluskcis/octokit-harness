# Octokit Harness

A flexible toolkit for working with GitHub API using Octokit. This library provides common utilities, services, and abstractions to make GitHub API interactions more straightforward.

## Installation

```bash
npm install octokit-harness
```

## Usage

### As a Library

```typescript
import { init_client, OctokitClient, Logger } from "octokit-harness";

// Initialize client and logger
const { logger, client } = await init_client({
  orgName: "my-org",
  accessToken: process.env.GITHUB_TOKEN,
  verbose: true,
});

// Use the client to interact with GitHub API
const repos = [];
for await (const repo of client.listReposForOrg("my-org", 10)) {
  repos.push(repo);
}

logger.info(`Found ${repos.length} repositories`);
```

### Creating Custom Commands

You can create custom commands that build on the octokit-harness toolkit:

```typescript
// my-command.ts
import {
  createCommand,
  registerAndExport,
  init_client,
  VERSION,
  Arguments,
} from "octokit-harness";
import { Option } from "commander";

// Define command-specific arguments
interface MyCommandArgs extends Arguments {
  customOption?: string;
}

// Create the command
const myCommand = createCommand(
  "my-command",
  "Description of what my command does",
  VERSION
)
  .addOption(
    new Option("--custom-option <value>", "A custom option").env(
      "CUSTOM_OPTION"
    )
  )
  .action(async (opts: MyCommandArgs) => {
    // Initialize client and logger
    const { logger, client } = await init_client(opts);

    logger.info("Running my custom command...");

    try {
      // Command implementation using client...

      logger.info("Command completed successfully");
    } catch (error) {
      logger.error(`Error executing command: ${error}`);
      process.exit(1);
    }
  });

// Export and register the command
export default registerAndExport(myCommand);
```

### Building a CLI with Custom Commands

```typescript
// index.ts
import { run } from "octokit-harness";

// Import your commands to register them
import "./my-command.js";
import "./another-command.js";

// Run the CLI
run();
```

## Included Example Commands

### Simple Repository List Command

The package includes a simple example command that lists repositories from a GitHub organization:

```typescript
// How to use the included example command
import { run } from "octokit-harness";
import "../example/simple-command.js";

run();
```

Run the command:

```bash
# List repositories as JSON (default)
npx octokit-harness list-repos --org-name my-organization --access-token my-token

# List repositories as CSV
npx octokit-harness list-repos --org-name my-organization --access-token my-token --format csv
```

## Plugin Architecture

Octokit Harness uses a plugin architecture that makes it easy to add new commands:

1. **Command Registry**: Commands are registered in a central registry when imported
2. **Auto-discovery**: Commands in the `commands` directory are automatically discovered
3. **Independent Commands**: Each command is a self-contained module that registers itself

### Creating a Plugin Command

There are several ways to create commands, from most flexible to most simplified:

#### 1. Standard Command Creation

```typescript
// my-plugin.ts
import { Option } from "commander";
import {
  createCommand,
  registerAndExport,
  init_client,
  Arguments,
} from "octokit-harness";
import VERSION from "./version.js";

interface MyPluginArgs extends Arguments {
  extraOption?: string;
}

const myPlugin = createCommand(
  "my-plugin",
  "My custom GitHub operation",
  VERSION
)
  .addOption(
    new Option("--extra-option <value>", "Additional option").env(
      "EXTRA_OPTION"
    )
  )
  .action(async (opts: MyPluginArgs) => {
    const { logger, client } = await init_client(opts);

    try {
      // Implement your command logic here
      logger.info("Plugin command executed successfully");
    } catch (error) {
      logger.error(`Error in plugin: ${error}`);
      process.exit(1);
    }
  });

export default registerAndExport(myPlugin);
```

#### 2. Simplified Command Creation

For even faster command creation, use the `createBasicCommand` helper which handles all the boilerplate:

```typescript
// super-simple.ts
import { Option } from "commander";
import {
  createBasicCommand,
  Arguments,
  OctokitClient,
  Logger,
} from "octokit-harness";
import VERSION from "./version.js";

interface MySimpleArgs extends Arguments {
  count?: number;
}

// Just provide the command metadata and your handler function
export default createBasicCommand<MySimpleArgs>(
  "super-simple",
  "My simplified GitHub command",
  VERSION,
  // This function gets client, logger, and options pre-configured
  async (client: OctokitClient, logger: Logger, options: MySimpleArgs) => {
    logger.info("Starting operation...");

    // Your command implementation here - no try/catch needed!
    const repos = await client.listReposForOrg(
      options.orgName!,
      options.count || 10
    );

    // Display results
    console.table(repos);
  },
  // Optional: add custom command options
  (cmd) =>
    cmd.addOption(
      new Option("--count <number>", "Number of items to process")
        .env("ITEM_COUNT")
        .argParser(parseInt)
    )
);
```

The `createBasicCommand` approach significantly reduces boilerplate by:

- Automatically initializing the client and logger
- Handling error logging and process exit
- Setting up standard command options
- Using TypeScript generics to ensure type safety

2. Import your command in your main application:

```typescript
import { run } from "octokit-harness";
import "./my-plugin.js";

run();
```

3. Run your command:

```bash
npx my-app my-plugin --org-name my-org --access-token my-token --extra-option value
```

## Available Services

- `OctokitClient`: A wrapper around Octokit with useful GitHub API methods
- `Logger`: Winston-based logger configured for GitHub operations
- `init_client`: Initializes both the client and logger
- `createCommand`: Helper to create standardized commander.js commands

## Environment Variables

The following environment variables are supported:

- `ORG_NAME`: The GitHub organization name
- `ACCESS_TOKEN`: GitHub personal access token
- `APP_ID`: GitHub App ID
- `PRIVATE_KEY`: GitHub App private key
- `PRIVATE_KEY_FILE`: Path to GitHub App private key file
- `APP_INSTALLATION_ID`: GitHub App installation ID
- `BASE_URL`: GitHub API base URL
- `PROXY_URL`: Proxy URL if required
- `VERBOSE`: Enable verbose logging

## License

MIT
