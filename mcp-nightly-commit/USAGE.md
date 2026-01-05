# How to Use the MCP Nightly Commit Server

This guide walks you through setting up and using the MCP Nightly Commit Server to automatically commit your code changes every night at 10 PM.

## Quick Start

### Step 1: Install and Build

```bash
cd mcp-nightly-commit
npm install
npm run build
```

### Step 2: Configure Claude

Add the MCP server to your Claude configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nightly-commit": {
      "command": "node",
      "args": ["/Users/yourname/path/to/SemesterFlow/mcp-nightly-commit/dist/index.js"],
      "cwd": "/Users/yourname/path/to/your/project"
    }
  }
}
```

**Important**: Replace the paths with your actual paths:

- `args[0]`: Full path to the built MCP server
- `cwd`: Full path to the git repository you want to commit to

### Step 3: Restart Claude

Close and reopen Claude Desktop to load the new MCP server.

## Using the MCP Tools

Once configured, you can use these tools in Claude:

### Enable Nightly Commits

```
Please enable nightly commits using the schedule_nightly_commit tool
```

Claude will use the tool with:

- `enabled: true`
- `time: "0 22 * * *"` (10 PM daily)

### Manual Commit Check

```
Please check for changes and commit if valid using the check_and_commit tool
```

### Custom Schedule

```
Set up nightly commits for 11:30 PM using the schedule_nightly_commit tool
```

Claude will use:

- `enabled: true`
- `time: "30 23 * * *"`

### Disable Nightly Commits

```
Disable the nightly commit schedule using the schedule_nightly_commit tool
```

## Alternative: System Cron Setup

If you prefer not to use the MCP integration, you can set up a system cron job:

```bash
# Edit your crontab
crontab -e

# Add this line (adjust paths):
0 22 * * * cd /path/to/your/project && node /path/to/SemesterFlow/mcp-nightly-commit/dist/scheduler.js
```

## What Happens During a Nightly Commit

1. **Change Detection**: Checks if there are any uncommitted changes
2. **Code Validation**: Runs available validation scripts:
   - `npm run lint` (if exists)
   - `npm run typecheck` (if exists)
   - `npm run test` (if exists)
   - `npm run build` (if exists)
   - Falls back to `npx tsc --noEmit` for TypeScript projects
3. **Commit**: If validation passes, stages all changes and commits with auto-generated message

## Commit Message Examples

The service generates descriptive commit messages:

- `Nightly commit 2025-12-03 - 2 modified, 1 new files`
- `Nightly commit 2025-12-03 - 5 modified files`
- `Nightly commit 2025-12-03 - 1 new, 3 deleted files`

## Configuration File

The service creates `.nightly-commit.json` in your project root:

```json
{
  "enabled": true,
  "cronTime": "0 22 * * *"
}
```

This file persists your schedule settings across restarts.

## Cron Schedule Examples

- `"0 22 * * *"` - Every day at 10:00 PM
- `"30 23 * * *"` - Every day at 11:30 PM
- `"0 22 * * 1-5"` - Weekdays only at 10:00 PM
- `"0 22 * * 0,6"` - Weekends only at 10:00 PM
- `"0 0 * * *"` - Every day at midnight

## Validation Requirements

For commits to succeed, ALL enabled validation steps must pass:

### Required npm Scripts (Optional)

Add these to your `package.json` for comprehensive validation:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "build": "vite build"
  }
}
```

### What Causes Validation Failure

- ESLint errors
- TypeScript compilation errors
- Test failures
- Build failures

## Troubleshooting

### MCP Server Not Loading

1. Check Claude configuration file syntax
2. Verify file paths are absolute and correct
3. Ensure the server is built: `npm run build`
4. Restart Claude Desktop

### Commits Not Working

1. Ensure you're in a git repository
2. Check that validation scripts pass manually
3. Verify git configuration (user.name, user.email)
4. Check file permissions

### Schedule Not Running

1. Verify the schedule is enabled: check `.nightly-commit.json`
2. For system cron: check with `crontab -l`
3. Check system time and timezone settings

### Manual Testing

Test the service manually:

```bash
# Run a manual commit check
cd your-project
node /path/to/mcp-nightly-commit/dist/scheduler.js
```

## Security Notes

- The service only commits to the current repository
- Uses your existing git configuration
- Never commits if validation fails
- All operations are logged for transparency
- No external network access required
