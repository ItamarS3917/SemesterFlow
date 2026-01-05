# Instructions for Antigravity IDE

## 🎯 Important: Read This First

### Repository Location

**Always work from:** `/Users/itamarmacbook/Desktop/SemesterFlow`

**Current state:**

- Branch: `main`
- Status: Clean, up-to-date
- Latest commit: Professional Git workflow tools added
- No merge conflicts

### ⚠️ CRITICAL: Never Work Directly on Main

**Before making ANY changes, you MUST create a feature branch:**

```bash
./git-workflow.sh new-feature <descriptive-name>
```

**Examples:**

```bash
./git-workflow.sh new-feature add-export-feature
./git-workflow.sh new-feature fix-calendar-bug
./git-workflow.sh new-feature improve-ui-performance
```

This ensures:

- ✅ Changes are isolated and reviewable
- ✅ Main branch stays stable
- ✅ Easy to rollback if needed
- ✅ Professional Git workflow

## 📋 Workflow for Every Task

### Step 1: Create Feature Branch

```bash
cd /Users/itamarmacbook/Desktop/SemesterFlow
./git-workflow.sh new-feature <your-feature-name>
```

### Step 2: Make Your Changes

- Write code
- Test changes
- Ensure everything works

### Step 3: Commit Changes

```bash
./git-workflow.sh commit "feat: description of what you added"
```

Or manually:

```bash
git add .
git commit -m "feat: description of what you added"
git push -u origin <your-feature-name>
```

### Step 4: Notify User

Tell the user:

- ✅ What branch the changes are on
- ✅ What was implemented
- ✅ How to test it
- ✅ That they should review and merge via PR

## 🎨 Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
refactor: improve code structure
style: format code
test: add tests
chore: update dependencies
```

**Examples:**

```
feat: add CSV export functionality to assignments
fix: resolve calendar sync issue with Google Calendar
docs: add API documentation for chat endpoints
refactor: simplify authentication context logic
```

## 🔍 Before You Start

Always run a health check:

```bash
./git-workflow.sh health
```

This shows:

- Current branch
- Uncommitted changes
- Unpushed commits
- Worktree status

## 🚨 What NOT To Do

❌ **NEVER** work directly on `main` branch
❌ **NEVER** force push (`git push -f`)
❌ **NEVER** commit directly without creating a branch first
❌ **NEVER** merge your own PRs without user approval

## ✅ What TO Do

✅ **ALWAYS** create a feature branch first
✅ **ALWAYS** write descriptive commit messages
✅ **ALWAYS** test your changes before committing
✅ **ALWAYS** inform the user when work is complete

## 📚 Reference

**Read the complete guide:** `GIT_WORKFLOW_GUIDE.md`

**Quick commands:**

```bash
./git-workflow.sh help              # Show all commands
./git-workflow.sh health            # Check repo status
./git-workflow.sh new-feature <name> # Create branch
./git-workflow.sh commit "message"  # Quick commit
./git-workflow.sh list-branches     # Show all branches
./git-workflow.sh cleanup           # Remove old worktrees
```

## 🎯 Example Complete Workflow

```bash
# 1. Check health
./git-workflow.sh health

# 2. Create feature branch
./git-workflow.sh new-feature add-dark-mode

# 3. Make changes to code...
# (edit files, write code)

# 4. Test changes
npm run dev  # or appropriate test command

# 5. Commit when ready
git add .
git commit -m "feat: implement dark mode toggle with user preference storage"

# 6. Push to remote
git push -u origin add-dark-mode

# 7. Inform user
# "I've implemented dark mode on the 'add-dark-mode' branch.
#  Please review and create a PR to merge into main."
```

## 🆘 If Something Goes Wrong

**Made changes on main by mistake?**

```bash
# Save your work
git stash

# Create a branch
./git-workflow.sh new-feature save-my-work

# Apply changes
git stash pop

# Reset main
git checkout main
git reset --hard origin/main
```

**Need to undo last commit?**

```bash
git reset --soft HEAD~1  # Keeps changes
# or
git reset --hard HEAD~1  # Discards changes
```

**Having merge conflicts?**

```bash
# Ask the user for guidance
# Don't try to resolve complex conflicts automatically
```

---

## 🎓 Remember

You are working on a **production codebase** with **real users**. Always:

1. **Create a branch** before any changes
2. **Test thoroughly** before committing
3. **Write clear** commit messages
4. **Communicate** what you did to the user
5. **Follow** the established patterns in the codebase

---

**Questions?** Check `GIT_WORKFLOW_GUIDE.md` for detailed documentation.
