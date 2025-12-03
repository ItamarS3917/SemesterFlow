# Project Monitoring & Error Prevention Setup Guide

This guide helps you set up automated code review, error tracking, and project monitoring for SemesterFlow.

## 🎯 Overview

Your project now has THREE layers of protection:
1. **CodeRabbit** - Automated PR reviews (catches logic errors, security flaws, missing tests)
2. **Sentry MCP** - Error tracking & monitoring (catches runtime errors)
3. **GitHub MCP** - CI/CD monitoring & workflow automation

---

## 📋 Setup Checklist

### ✅ Step 1: CodeRabbit (GitHub App) - **YOU NEED TO DO THIS**

CodeRabbit is a GitHub app that reviews every PR automatically.

**Installation:**
1. Go to: https://coderabbit.ai/
2. Click "Add to GitHub" or "Get Started"
3. Authorize the app
4. Select repository: `ItamarS3917/SemesterFlow-Study-Tracker`
5. Grant permissions

**What it does:**
- Reviews every PR automatically
- Spots logic errors, security flaws, missing tests
- Comments directly on your PRs with suggestions
- Acts as a "senior dev" reviewer

**Usage:**
- Open any PR and CodeRabbit will review it automatically
- Comment `@coderabbitai review` to trigger manual review
- Comment `@coderabbitai help` for available commands

---

### ✅ Step 2: Sentry MCP Server (Installed ✓)

**Status:** Configuration added to `~/Library/Application Support/Claude/claude_desktop_config.json`

**What you need to do:**

1. **Create a Sentry account** (if you don't have one):
   - Go to: https://sentry.io/signup/
   - Create a free account

2. **Get your Sentry credentials:**
   - Go to: https://sentry.io/settings/account/api/auth-tokens/
   - Click "Create New Token"
   - Give it a name (e.g., "Claude MCP")
   - Select scopes: `project:read`, `org:read`, `event:read`
   - Copy the token

3. **Get your organization slug:**
   - Go to: https://sentry.io/settings/
   - Your org slug is in the URL: `sentry.io/settings/YOUR-ORG-SLUG/`

4. **Update your MCP config:**
   ```bash
   # Edit the config file
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

   Replace these empty values:
   ```json
   "SENTRY_AUTH_TOKEN": "YOUR_SENTRY_AUTH_TOKEN_HERE",
   "SENTRY_ORG": "YOUR_ORG_SLUG_HERE"
   ```

5. **Restart Claude Desktop** for changes to take effect

**What it does:**
- Tracks runtime errors in production
- Monitors performance issues
- Identifies breaking inputs
- Shows you which tools/functions are slow or failing

---

### ✅ Step 3: GitHub MCP Server (Installed ✓)

**Status:** Configuration added to `~/Library/Application Support/Claude/claude_desktop_config.json`

**What you need to do:**

1. **Create a GitHub Personal Access Token:**
   - Go to: https://github.com/settings/tokens/new
   - Give it a name (e.g., "Claude MCP")
   - Select scopes:
     - `repo` (Full control of private repositories)
     - `workflow` (Update GitHub Action workflows)
     - `read:org` (Read org and team membership)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Update your MCP config:**
   ```bash
   # Edit the config file
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

   Replace the empty value:
   ```json
   "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_YOUR_TOKEN_HERE"
   ```

3. **Restart Claude Desktop** for changes to take effect

**What it does:**
- Monitors GitHub Actions workflows
- Analyzes PR diffs
- Creates and manages issues
- Runs security scanning
- Provides CI/CD insights

---

## 🔧 Alternative: Sentry Remote MCP (Easier!)

If you don't want to manage tokens locally, Sentry offers a **remote hosted MCP** that's easier:

**Using Claude Code CLI:**
```bash
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
```

Then authenticate with:
```bash
/mcp
```

This uses OAuth and is more convenient than the local setup.

---

## 🧪 Testing Your Setup

After completing the setup, test each integration:

### Test Sentry:
Ask Claude: "What are the most common errors in my Sentry project?"

### Test GitHub:
Ask Claude: "Show me the status of recent GitHub Actions runs for SemesterFlow"

### Test CodeRabbit:
1. Create a test branch
2. Make a small change
3. Open a PR
4. Wait ~30 seconds for CodeRabbit to review it

---

## 📊 What CodeScene Would Have Done

**Note:** CodeScene MCP doesn't appear to have a public/free MCP server yet. Here are alternatives:

### Alternative 1: Use GitHub Actions with Code Quality Tools

Add these to `.github/workflows/code-quality.yml`:
- **ESLint** - Linting
- **SonarCloud** - Code quality & technical debt
- **CodeQL** - Security analysis

### Alternative 2: Use Semgrep (Has an MCP!)

Semgrep provides static analysis similar to CodeScene:
```bash
# Install Semgrep MCP
npx @semgrep/mcp-server
```

Add to your MCP config:
```json
"semgrep": {
  "command": "npx",
  "args": ["-y", "@semgrep/mcp-server"]
}
```

---

## 🚀 Quick Start (TL;DR)

1. **Install CodeRabbit:** Go to https://coderabbit.ai/ → Add to GitHub → Select your repo
2. **Get Sentry token:** https://sentry.io/settings/account/api/auth-tokens/
3. **Get GitHub token:** https://github.com/settings/tokens/new
4. **Update config:** Open `~/Library/Application Support/Claude/claude_desktop_config.json`
5. **Add tokens** to the Sentry and GitHub sections
6. **Restart Claude Desktop**

---

## 📚 Resources

- [Sentry MCP Documentation](https://docs.sentry.io/product/sentry-mcp/)
- [GitHub MCP Server](https://github.com/github/github-mcp-server)
- [CodeRabbit Documentation](https://coderabbit.ai/docs)
- [Claude Code MCP Guide](https://docs.anthropic.com/en/docs/claude-code/mcp)

---

## 🆘 Troubleshooting

**MCP servers not showing up:**
- Make sure you restarted Claude Desktop after editing the config
- Check the JSON syntax is valid (use a JSON validator)
- Check Claude Desktop logs for errors

**Authentication errors:**
- Verify your tokens are correct and haven't expired
- Make sure tokens have the right scopes/permissions
- For Sentry, check your org slug is correct

**CodeRabbit not reviewing:**
- Make sure you installed it on the correct repository
- Check the app has proper permissions
- Try commenting `@coderabbitai review` to trigger manually

---

## 🎉 You're Done!

Once set up, you'll have:
- ✅ Automated PR reviews catching errors before merge
- ✅ Real-time error tracking in production
- ✅ GitHub workflow monitoring
- ✅ Proactive detection of code quality issues

Your "big vibe coding project" is now protected against future errors!
