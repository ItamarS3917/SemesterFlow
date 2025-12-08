# MCP Nightly Commit Server

An MCP (Model Context Protocol) server that automatically commits changes to git every night at 10 PM, but only after validating the code runs without errors.

## Features

- **Change Detection**: Only commits when there are actual changes
- **Code Validation**: Runs linting, type checking, tests, and builds before committing
- **Flexible Scheduling**: Customizable cron schedule (defaults to 10 PM daily)
- **Smart Commit Messages**: Auto-generated messages with file change summaries
- **MCP Integration**: Works with Claude and other MCP clients

## Setup

### 1. Install Dependencies

```bash
cd mcp-nightly-commit
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Configure Claude (MCP Client)

Add to your Claude configuration file (`claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "nightly-commit": {
      "command": "node",
      "args": ["/path/to/SemesterFlow/mcp-nightly-commit/dist/index.js"],
      "cwd": "/path/to/your/project"
    }
  }
}
```

### 4. Alternative: System Cron Setup

For running without MCP client dependency, add to your system crontab:

```bash
# Edit crontab
crontab -e

# Add this line (adjust paths as needed):
0 22 * * * cd /path/to/your/project && node /path/to/SemesterFlow/mcp-nightly-commit/dist/scheduler.js
```

## Usage

### Via MCP Tools

Once configured with Claude, you can use:

```
# Enable nightly commits at 10 PM
Use the schedule_nightly_commit tool with enabled=true

# Manual commit check
Use the check_and_commit tool

# Custom schedule (e.g., 11:30 PM)
Use schedule_nightly_commit with enabled=true, time="30 23 * * *"
```

### Direct Command Line

```bash
# Manual commit check
npm run schedule

# Or directly
node dist/scheduler.js
```

## How It Works

1. **Change Detection**: Uses `simple-git` to check for uncommitted changes
2. **Validation Pipeline**:
   - Runs `npm run lint` if available
   - Runs `npm run typecheck` if available  
   - Runs `npm run test` if available
   - Runs `npm run build` if available
   - Falls back to `npx tsc --noEmit` for TypeScript projects
3. **Smart Commits**: 
   - Only commits if validation passes
   - Generates descriptive commit messages
   - Stages all changes automatically

## Configuration

The service creates a `.nightly-commit.json` config file in your project root:

```json
{
  "enabled": true,
  "cronTime": "0 22 * * *"
}
```

## Validation Scripts

The service looks for these npm scripts in `package.json`:
- `lint` - Code linting
- `typecheck` - Type checking  
- `test` - Running tests
- `build` - Building the project

If none exist, it tries `npx tsc --noEmit` for TypeScript projects.

## Commit Message Format

Auto-generated messages follow this pattern:
```
Nightly commit 2025-12-03 - 2 modified, 1 new files
```

## Security

- Only commits to the current repository
- Validates code before committing
- Never commits if validation fails
- Runs in the context of the current user's git configuration