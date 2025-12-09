#!/bin/bash

# ============================================================================
# SemesterFlow Git Workflow Manager
# ============================================================================
# Professional Git workflow automation with worktree cleanup and branch management
# Usage: ./git-workflow.sh [command] [options]
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Repository configuration
REPO_ROOT="$(git rev-parse --show-toplevel)"
MAIN_BRANCH="main"
WORKTREE_DIR="$HOME/.claude-worktrees/SemesterFlow"

# ============================================================================
# Utility Functions
# ============================================================================

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# ============================================================================
# Worktree Management
# ============================================================================

cleanup_worktrees() {
    print_header "Cleaning Up Unused Worktrees"

    if [ ! -d "$WORKTREE_DIR" ]; then
        print_info "No worktree directory found at $WORKTREE_DIR"
        return 0
    fi

    # Get list of all worktrees
    local worktrees=$(git worktree list --porcelain | grep "^worktree" | awk '{print $2}')
    local count=0
    local removed=0

    echo ""
    print_info "Scanning for Claude Code worktrees..."

    for worktree in $worktrees; do
        # Skip the main repository
        if [ "$worktree" = "$REPO_ROOT" ]; then
            continue
        fi

        # Check if it's a Claude worktree
        if [[ "$worktree" == *".claude-worktrees"* ]]; then
            count=$((count + 1))
            local branch=$(basename "$worktree")

            # Check for uncommitted changes
            cd "$worktree"
            if [[ -n $(git status --short) ]]; then
                print_warning "Worktree '$branch' has uncommitted changes - SKIPPING"
                echo "  → Location: $worktree"
                echo "  → Review manually or use: git worktree remove --force $worktree"
            else
                # Check if branch is merged
                local merged=""
                if git branch --merged "$MAIN_BRANCH" | grep -q "$branch"; then
                    merged=" (merged to $MAIN_BRANCH)"
                fi

                # Prompt for removal
                echo ""
                print_info "Found clean worktree: $branch$merged"
                echo "  → Location: $worktree"
                read -p "  Remove this worktree? [y/N] " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    cd "$REPO_ROOT"
                    if git worktree remove "$worktree" 2>/dev/null; then
                        print_success "Removed worktree: $branch"
                        removed=$((removed + 1))
                    else
                        print_error "Failed to remove worktree: $branch"
                    fi
                fi
            fi
        fi
    done

    cd "$REPO_ROOT"

    echo ""
    print_success "Cleanup complete: $removed/$count worktrees removed"

    # Prune stale worktree references
    git worktree prune
    print_success "Pruned stale worktree references"
}

auto_cleanup_worktrees() {
    print_header "Auto-Cleanup: Removing Clean, Merged Worktrees"

    if [ ! -d "$WORKTREE_DIR" ]; then
        print_info "No worktree directory found"
        return 0
    fi

    local worktrees=$(git worktree list --porcelain | grep "^worktree" | awk '{print $2}')
    local removed=0

    for worktree in $worktrees; do
        if [ "$worktree" = "$REPO_ROOT" ]; then
            continue
        fi

        if [[ "$worktree" == *".claude-worktrees"* ]]; then
            local branch=$(basename "$worktree")

            cd "$worktree"
            # Only remove if clean AND merged
            if [[ -z $(git status --short) ]] && git branch --merged "$MAIN_BRANCH" | grep -q "$branch"; then
                cd "$REPO_ROOT"
                if git worktree remove "$worktree" 2>/dev/null; then
                    print_success "Auto-removed: $branch (clean & merged)"
                    removed=$((removed + 1))
                fi
            fi
        fi
    done

    cd "$REPO_ROOT"
    print_success "Auto-cleanup complete: $removed worktrees removed"
    git worktree prune
}

list_worktrees() {
    print_header "Active Worktrees"

    echo ""
    git worktree list

    echo ""
    print_info "Total worktrees: $(git worktree list | wc -l)"
}

# ============================================================================
# Branch Management
# ============================================================================

create_feature_branch() {
    local branch_name="$1"

    if [ -z "$branch_name" ]; then
        print_error "Branch name required"
        echo "Usage: $0 new-feature <feature-name>"
        exit 1
    fi

    print_header "Creating Feature Branch: $branch_name"

    # Ensure we're on main and up to date
    print_info "Switching to $MAIN_BRANCH and updating..."
    git checkout "$MAIN_BRANCH"
    git pull origin "$MAIN_BRANCH"

    # Create new branch
    print_info "Creating branch: $branch_name"
    git checkout -b "$branch_name"

    print_success "Feature branch '$branch_name' created and checked out"
    print_info "You can now make changes on this branch"
    echo ""
    echo "When ready to push:"
    echo "  git push -u origin $branch_name"
}

sync_branch() {
    local current_branch=$(git branch --show-current)

    print_header "Syncing Branch: $current_branch"

    if [ "$current_branch" = "$MAIN_BRANCH" ]; then
        print_info "Pulling latest changes from origin..."
        git pull origin "$MAIN_BRANCH"
        print_success "Main branch updated"
    else
        print_info "Updating $MAIN_BRANCH..."
        git fetch origin "$MAIN_BRANCH:$MAIN_BRANCH"

        echo ""
        read -p "Merge $MAIN_BRANCH into $current_branch? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git merge "$MAIN_BRANCH"
            print_success "Merged $MAIN_BRANCH into $current_branch"
        fi
    fi
}

delete_branch() {
    local branch_name="$1"

    if [ -z "$branch_name" ]; then
        print_error "Branch name required"
        echo "Usage: $0 delete-branch <branch-name>"
        exit 1
    fi

    print_header "Deleting Branch: $branch_name"

    # Safety check
    if [ "$branch_name" = "$MAIN_BRANCH" ]; then
        print_error "Cannot delete main branch!"
        exit 1
    fi

    local current_branch=$(git branch --show-current)
    if [ "$current_branch" = "$branch_name" ]; then
        print_info "Switching to $MAIN_BRANCH first..."
        git checkout "$MAIN_BRANCH"
    fi

    # Check if merged
    if git branch --merged "$MAIN_BRANCH" | grep -q "$branch_name"; then
        print_info "Branch is merged to $MAIN_BRANCH"
        git branch -d "$branch_name"
        print_success "Local branch deleted"

        # Delete remote if exists
        if git ls-remote --heads origin "$branch_name" | grep -q "$branch_name"; then
            read -p "Delete remote branch too? [y/N] " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git push origin --delete "$branch_name"
                print_success "Remote branch deleted"
            fi
        fi
    else
        print_warning "Branch is NOT merged to $MAIN_BRANCH"
        read -p "Force delete anyway? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git branch -D "$branch_name"
            print_success "Local branch force-deleted"
        fi
    fi
}

list_branches() {
    print_header "Branch Status"

    echo ""
    echo -e "${GREEN}Merged to $MAIN_BRANCH:${NC}"
    git branch --merged "$MAIN_BRANCH" | grep -v "^*" | grep -v "$MAIN_BRANCH"

    echo ""
    echo -e "${YELLOW}NOT merged to $MAIN_BRANCH:${NC}"
    git branch --no-merged "$MAIN_BRANCH"

    echo ""
    echo -e "${BLUE}Current branch:${NC}"
    git branch --show-current
}

# ============================================================================
# Git Status & Health Check
# ============================================================================

health_check() {
    print_header "Repository Health Check"

    echo ""
    print_info "Repository: $REPO_ROOT"
    print_info "Current branch: $(git branch --show-current)"

    echo ""
    echo -e "${BLUE}Git Status:${NC}"
    git status --short

    echo ""
    echo -e "${BLUE}Unpushed commits:${NC}"
    local unpushed=$(git log origin/$(git branch --show-current)..HEAD --oneline 2>/dev/null | wc -l || echo "0")
    if [ "$unpushed" -gt 0 ]; then
        print_warning "$unpushed commit(s) not pushed"
        git log origin/$(git branch --show-current)..HEAD --oneline 2>/dev/null || true
    else
        print_success "All commits pushed"
    fi

    echo ""
    echo -e "${BLUE}Worktrees:${NC}"
    local worktree_count=$(git worktree list | wc -l)
    echo "  Total: $worktree_count"

    if [ -d "$WORKTREE_DIR" ]; then
        local claude_worktrees=$(find "$WORKTREE_DIR" -maxdepth 1 -type d | wc -l)
        echo "  Claude worktrees: $((claude_worktrees - 1))"

        if [ $((claude_worktrees - 1)) -gt 3 ]; then
            print_warning "Consider running cleanup to remove old worktrees"
        fi
    fi

    echo ""
    echo -e "${BLUE}Recent commits:${NC}"
    git log --oneline -5
}

# ============================================================================
# Quick Commit & Push
# ============================================================================

quick_commit() {
    local message="$1"

    if [ -z "$message" ]; then
        print_error "Commit message required"
        echo "Usage: $0 commit \"your commit message\""
        exit 1
    fi

    print_header "Quick Commit"

    echo ""
    echo -e "${BLUE}Changed files:${NC}"
    git status --short

    echo ""
    read -p "Stage all changes and commit? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add -A
        git commit -m "$message"
        print_success "Committed: $message"

        echo ""
        read -p "Push to remote? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            local current_branch=$(git branch --show-current)
            git push -u origin "$current_branch"
            print_success "Pushed to origin/$current_branch"
        fi
    fi
}

# ============================================================================
# Help & Usage
# ============================================================================

show_help() {
    cat << EOF
${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}
${BLUE}  SemesterFlow Git Workflow Manager${NC}
${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

${GREEN}WORKTREE MANAGEMENT:${NC}
  cleanup              Interactive cleanup of unused worktrees
  auto-cleanup         Auto-remove clean, merged worktrees
  list-worktrees       Show all active worktrees

${GREEN}BRANCH MANAGEMENT:${NC}
  new-feature <name>   Create a new feature branch from main
  sync                 Sync current branch with main
  delete-branch <name> Delete a branch (safely)
  list-branches        Show all branches and their status

${GREEN}GENERAL:${NC}
  health               Run repository health check
  commit "message"     Quick commit all changes with message
  help                 Show this help message

${GREEN}EXAMPLES:${NC}
  ./git-workflow.sh cleanup
  ./git-workflow.sh new-feature add-dark-mode
  ./git-workflow.sh commit "fix: resolve login bug"
  ./git-workflow.sh health

${YELLOW}TIPS:${NC}
  • Run 'cleanup' weekly to remove old Claude Code worktrees
  • Use 'new-feature' for each new feature/fix
  • Run 'health' before starting work
  • Keep your main branch clean and up-to-date

EOF
}

# ============================================================================
# Main Script
# ============================================================================

main() {
    cd "$REPO_ROOT"

    case "${1:-help}" in
        cleanup)
            cleanup_worktrees
            ;;
        auto-cleanup)
            auto_cleanup_worktrees
            ;;
        list-worktrees)
            list_worktrees
            ;;
        new-feature)
            create_feature_branch "$2"
            ;;
        sync)
            sync_branch
            ;;
        delete-branch)
            delete_branch "$2"
            ;;
        list-branches)
            list_branches
            ;;
        health)
            health_check
            ;;
        commit)
            quick_commit "$2"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
