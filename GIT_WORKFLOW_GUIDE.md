# Git Workflow Guide for SemesterFlow

This guide ensures professional Git practices for the SemesterFlow project.

## 🚀 Quick Start

### For AI Assistants (Antigravity, Claude Code, etc.)

**Before making any changes:**

```bash
# 1. Always create a feature branch
./git-workflow.sh new-feature your-feature-name

# 2. Make your changes...

# 3. Commit and push
./git-workflow.sh commit "feat: your descriptive commit message"
```

### For Manual Development

```bash
# Check repository health
./git-workflow.sh health

# Create a new feature
./git-workflow.sh new-feature add-dark-mode

# Work on your feature...

# Commit changes
git add .
git commit -m "feat: add dark mode toggle"
git push -u origin add-dark-mode

# Create PR on GitHub, merge, then delete branch
./git-workflow.sh delete-branch add-dark-mode
```

## 📋 Available Commands

### Worktree Management

```bash
# List all active worktrees
./git-workflow.sh list-worktrees

# Interactive cleanup (safe, asks before removing)
./git-workflow.sh cleanup

# Auto-cleanup (removes clean, merged worktrees)
./git-workflow.sh auto-cleanup
```

**When to run cleanup:**

- Weekly maintenance
- Before starting new work
- When you notice many old worktrees (>5)
- After merging several PRs

### Branch Management

```bash
# Create new feature branch from main
./git-workflow.sh new-feature <name>

# Sync current branch with main
./git-workflow.sh sync

# Delete a branch safely
./git-workflow.sh delete-branch <name>

# List all branches and status
./git-workflow.sh list-branches
```

### Quick Operations

```bash
# Commit all changes with message
./git-workflow.sh commit "your message"

# Check repository health
./git-workflow.sh health
```

## 🎯 Best Practices

### Branch Naming Convention

```
feature/    - New features (feature/add-dark-mode)
fix/        - Bug fixes (fix/login-error)
refactor/   - Code refactoring (refactor/cleanup-components)
docs/       - Documentation (docs/update-readme)
chore/      - Maintenance tasks (chore/update-deps)
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples:**

```
feat: add user authentication
fix: resolve calendar sync issue
docs: update installation instructions
refactor: simplify assignment manager logic
```

### Workflow for AI Assistants

**Important:** AI assistants should ALWAYS work on feature branches, never directly on `main`.

```bash
# ✅ CORRECT: Create a branch first
./git-workflow.sh new-feature ai/improve-chatbot
# Make changes...
git add .
git commit -m "feat: enhance chatbot responses"
git push -u origin ai/improve-chatbot

# ❌ WRONG: Working directly on main
git checkout main
# Make changes... (DON'T DO THIS)
```

## 🔄 Complete Development Workflow

### 1. Start New Feature

```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
./git-workflow.sh new-feature awesome-feature

# Or manually:
git checkout -b feature/awesome-feature
```

### 2. Development

```bash
# Make changes to code...

# Check status
git status

# Review changes
git diff

# Stage changes
git add .

# Commit
git commit -m "feat: implement awesome feature"
```

### 3. Keep Branch Updated

```bash
# Sync with main periodically
./git-workflow.sh sync

# Or manually:
git fetch origin main:main
git merge main
```

### 4. Push & Create PR

```bash
# Push to remote
git push -u origin feature/awesome-feature

# Create Pull Request on GitHub
# After PR is approved and merged...
```

### 5. Cleanup

```bash
# Switch back to main
git checkout main
git pull origin main

# Delete local branch
./git-workflow.sh delete-branch feature/awesome-feature

# Cleanup old worktrees
./git-workflow.sh auto-cleanup
```

## 🧹 Maintenance Tasks

### Weekly Maintenance

```bash
# Check repository health
./git-workflow.sh health

# Clean up old worktrees
./git-workflow.sh cleanup

# Update main branch
git checkout main
git pull origin main

# Check for stale branches
./git-workflow.sh list-branches
```

### Monthly Maintenance

```bash
# Remove all merged branches
./git-workflow.sh list-branches
# Manually delete merged branches

# Prune remote references
git remote prune origin

# Garbage collection
git gc
```

## 🚨 Common Issues & Solutions

### Issue: Too Many Worktrees

**Problem:** Claude Code creates worktrees that accumulate over time.

**Solution:**

```bash
./git-workflow.sh auto-cleanup
```

### Issue: Merge Conflicts

**Problem:** Your branch conflicts with main.

**Solution:**

```bash
# Update main
git checkout main
git pull origin main

# Go back to your branch
git checkout your-branch

# Merge main
git merge main

# Resolve conflicts in your editor
# Then:
git add .
git commit -m "merge: resolve conflicts with main"
```

### Issue: Accidentally Working on Main

**Problem:** Made changes directly on main branch.

**Solution:**

```bash
# Create branch from current state
git checkout -b feature/save-my-work

# Now main will be clean
git checkout main
git reset --hard origin/main
```

### Issue: Want to Undo Last Commit

**Problem:** Committed something wrong.

**Solution:**

```bash
# Undo last commit, keep changes
git reset --soft HEAD~1

# Undo last commit, discard changes
git reset --hard HEAD~1
```

## 📊 Health Check Interpretation

```bash
./git-workflow.sh health
```

**Green signals:** ✅

- "All commits pushed" - You're in sync
- Working tree clean - No uncommitted changes
- Few worktrees (1-3) - Good cleanup

**Yellow signals:** ⚠️

- Unpushed commits - Need to push
- Several worktrees (4-10) - Consider cleanup soon

**Red signals:** 🚨

- Many worktrees (>10) - Cleanup needed NOW
- Uncommitted changes - Commit or stash
- Behind origin - Pull updates

## 🤖 Automation with Git Hooks

Add this to `.git/hooks/pre-push` to auto-cleanup:

```bash
#!/bin/bash
./git-workflow.sh auto-cleanup > /dev/null 2>&1 || true
```

## 📝 Quick Reference

```bash
# Most common commands
./git-workflow.sh new-feature <name>   # Start new work
./git-workflow.sh commit "message"     # Quick commit
./git-workflow.sh health               # Check status
./git-workflow.sh cleanup              # Remove old worktrees

# Branch workflow
git checkout main                      # Switch to main
git pull origin main                   # Update main
git checkout -b feature/name           # New branch
git add .                              # Stage changes
git commit -m "message"                # Commit
git push -u origin feature/name        # Push branch
```

## 🎓 Learning Resources

- [Git Documentation](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Branching Model](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

---

**Remember:** When in doubt, create a branch! It's always safer to work in isolation.
