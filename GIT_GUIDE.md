# Git Workflow Guide

## Repository Setup

The World Battle project is now using Git for version control!

### Current Status
- **Branch:** main
- **Initial Commit:** Phase 1 & 2 Complete (9,461 lines, 51 files)
- **Ignored:** node_modules, dist, build outputs, .env files

## Common Git Commands

### Check Status
```bash
git status
```

### View Commit History
```bash
git log --oneline
git log --graph --oneline --all
```

### Stage Changes
```bash
# Stage specific files
git add file1.js file2.ts

# Stage all changes
git add -A

# Stage by pattern
git add packages/ui/src/**/*.tsx
```

### Commit Changes
```bash
# Commit with message
git commit -m "Add feature X"

# Commit with detailed message
git commit -m "Add feature X

- Implemented Y
- Fixed Z
- Updated docs"
```

### View Changes
```bash
# See unstaged changes
git diff

# See staged changes
git diff --cached

# See changes in specific file
git diff packages/api/src/routes/games.ts
```

### Branch Management
```bash
# Create new branch
git checkout -b feature/new-ui

# Switch branches
git checkout main
git checkout feature/new-ui

# List branches
git branch

# Delete branch
git branch -d feature/old-feature
```

### Undo Changes
```bash
# Discard changes to specific file (CAREFUL!)
git checkout -- filename

# Unstage file
git reset HEAD filename

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) (VERY CAREFUL!)
git reset --hard HEAD~1
```

## Recommended Workflow

### Feature Development
```bash
# 1. Create feature branch
git checkout -b feature/interactive-map

# 2. Make changes, test, iterate

# 3. Stage and commit regularly
git add packages/ui/src/components/Map.tsx
git commit -m "Add interactive map component"

# 4. Continue development...
git add packages/ui/src/components/Territory.tsx
git commit -m "Add territory selection"

# 5. When feature complete, merge to main
git checkout main
git merge feature/interactive-map

# 6. Delete feature branch
git branch -d feature/interactive-map
```

### Phase/Checkpoint Workflow
```bash
# After completing each checkpoint
git add -A
git commit -m "Checkpoint 3.1: UI Foundation

- Created React app with Vite
- Set up routing
- Added Tailwind CSS
- Created base components"

# After completing entire phase
git tag -a phase-3 -m "Phase 3 Complete: UI Layer"
```

## Project-Specific Tips

### Testing Before Commit
```bash
# Always run tests before committing
cd packages/engine && npm test
cd packages/api && npm test
cd packages/ui && npm test  # (when Phase 3 is built)

# If all pass, commit
git add -A
git commit -m "Your message"
```

### Commit Message Format

Good commit messages:
```
✅ "Add player elimination logic to GameActionService"
✅ "Fix fortify connectivity validation bug"
✅ "Update API docs for attack endpoints"
✅ "Checkpoint 2.3: Attack Phase Complete"
```

Bad commit messages:
```
❌ "fix stuff"
❌ "update"
❌ "WIP"
❌ "asdf"
```

### What to Commit

**DO commit:**
- Source code (.ts, .tsx, .js, .jsx)
- Configuration files (tsconfig.json, package.json)
- Documentation (.md files)
- Tests (.test.ts)

**DON'T commit:**
- node_modules/
- dist/ or build/
- .env files with secrets
- IDE-specific files (.vscode/, .idea/)
- Log files
- OS files (.DS_Store)

## Viewing Your Work

### See What Changed
```bash
# Files changed in last commit
git show --stat

# Full diff of last commit
git show

# Changes since 3 commits ago
git diff HEAD~3
```

### Search History
```bash
# Find commits by message
git log --grep="attack"

# Find commits by author
git log --author="Your Name"

# Find commits that changed specific file
git log -- packages/api/src/routes/actions.ts
```

## Emergency Commands

### Accidentally Committed to Wrong Branch
```bash
# 1. Note the commit hash
git log -1

# 2. Go to correct branch
git checkout correct-branch

# 3. Cherry-pick the commit
git cherry-pick <commit-hash>

# 4. Go back and remove from wrong branch
git checkout wrong-branch
git reset --hard HEAD~1
```

### Need to Undo Last Commit
```bash
# Keep changes, undo commit
git reset --soft HEAD~1

# Make fixes
git add -A
git commit -m "Corrected message"
```

## Tags (Version Markers)

```bash
# Tag important milestones
git tag phase-1-complete
git tag phase-2-complete
git tag v1.0.0

# List tags
git tag

# Delete tag
git tag -d old-tag
```

## Connecting to Remote (GitHub, etc.)

When you create a GitHub repo:

```bash
# Add remote
git remote add origin https://github.com/yourusername/world-battle.git

# Push to remote
git push -u origin main

# Push tags
git push --tags

# Later pushes
git push
```

## Current Repository State

```
world-battle/
├── .git/                    # Git repository data
├── .gitignore              # Ignored files
├── packages/
│   ├── engine/            # Phase 1 (committed)
│   └── api/               # Phase 2 (committed)
├── README.md
└── Documentation files
```

**Latest Commit:** Phase 1 & 2 Complete
**Files Tracked:** 51
**Lines of Code:** 9,461

Ready for Phase 3 development! 🚀
