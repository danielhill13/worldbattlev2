# How to Use the Git Bundle

## What is a Git Bundle?

A Git bundle is a single file that contains your entire Git repository - all commits, history, branches, everything! It's like a portable version of your `.git` folder.

## Steps to Set Up Your Local Repository

### 1. Download the Bundle
Download `world-battle.bundle` from the outputs.

### 2. Clone from the Bundle

```bash
# Navigate to where you want the project
cd ~/Documents

# Clone from the bundle
git clone world-battle.bundle world-battle

cd world-battle
```

This creates a full Git repository with all 4 commits and history!

### 3. Connect to Your GitHub Repository

```bash
# Add your GitHub repo as the remote
git remote remove origin  # Remove the bundle as origin
git remote add origin https://github.com/danielhill13/worldbattlev2.git

# Verify it's set correctly
git remote -v
```

### 4. Push to GitHub

```bash
# Push all commits and branches
git push -u origin main

# Verify on GitHub
# Go to https://github.com/danielhill13/worldbattlev2
```

### 5. Install Dependencies

```bash
# Install all workspace dependencies
npm install

# Build the engine
cd packages/engine
npm run build

# Test everything works
npm test

cd ../api
npm test
```

You should see:
- ✅ Engine: 162 tests passing
- ✅ API: 50 tests passing

### 6. Start the API Server (Optional Test)

```bash
cd packages/api
npm run dev

# Should start on http://localhost:3000
# Test: curl http://localhost:3000/health
```

---

## What You Get

After cloning from the bundle, you'll have:

```
world-battle/
├── .git/                          # Full Git history ✅
├── packages/
│   ├── engine/                    # Phase 1
│   └── api/                       # Phase 2
├── README.md
├── GIT_GUIDE.md
├── GITHUB_SETUP.md
└── [all documentation]
```

**Git commits:**
```
1632247 - Add GitHub setup instructions
f4e3b17 - Add Git setup summary documentation
ec60476 - Add Git workflow guide
890bdc2 - Phase 1 & 2 Complete: Game Engine + API Layer
```

---

## Verify Everything Worked

After setup, run:

```bash
# Check Git status
git status
# Should say: "On branch main, nothing to commit, working tree clean"

# Check Git log
git log --oneline
# Should show 4 commits

# Check remote
git remote -v
# Should show: origin  https://github.com/danielhill13/worldbattlev2.git

# Run tests
npm test --workspace=packages/engine
npm test --workspace=packages/api
# Both should pass all tests
```

---

## Troubleshooting

### If GitHub asks for credentials:

**Option 1: Personal Access Token**
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when pushing

**Option 2: SSH (Better long-term)**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub: Settings → SSH and GPG keys

# Change remote to SSH
git remote set-url origin git@github.com:danielhill13/worldbattlev2.git
```

### If clone fails:
Make sure the bundle file is in the directory where you run the command, or provide full path:
```bash
git clone ~/Downloads/world-battle.bundle world-battle
```

---

## After Setup - Normal Git Workflow

```bash
# Make changes
git add -A
git commit -m "Your message"
git push

# Pull changes
git pull
```

---

## Ready for Phase 3!

Once setup is complete, you're ready to start building the UI layer:
- React + Vite
- Interactive map
- Game lobby
- Battle animations

Everything will be tracked in Git as we build! 🚀
