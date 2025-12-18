# Pushing to GitHub

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `world-battle`
3. Description: "Strategy game - TypeScript monorepo"
4. **Leave "Initialize with README" UNCHECKED** (we already have one)
5. Click "Create repository"

## Step 2: Connect and Push

Run these commands in `/home/claude/world-battle`:

```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR-USERNAME/world-battle.git

# Push to GitHub
git push -u origin main
```

If using SSH (recommended):
```bash
git remote add origin git@github.com:YOUR-USERNAME/world-battle.git
git push -u origin main
```

## Step 3: Clone to Your Local Machine

On your local computer:

```bash
cd ~/Documents  # or wherever you want it

# Clone the repository
git clone https://github.com/YOUR-USERNAME/world-battle.git

cd world-battle

# Install dependencies
npm install

# Build engine
cd packages/engine
npm run build

# Test everything works
npm test

cd ../api
npm test
```

---

## After Cloning

Your local setup:
```bash
world-battle/
├── .git/              # Full commit history ✅
├── packages/
│   ├── engine/        # Install: npm install
│   └── api/          # Install: npm install
└── [all files]
```

Run this in the root:
```bash
# Install all workspace dependencies
npm install

# Test engine
npm test --workspace=packages/engine

# Test API  
npm test --workspace=packages/api

# Start API server
npm run dev --workspace=packages/api
```

---

## Keeping in Sync

After pushing to GitHub, you can work locally and push changes:

```bash
# Make changes locally
git add -A
git commit -m "Your changes"
git push

# Pull changes from GitHub
git pull
```

---

## Troubleshooting

### Authentication Issues

If GitHub asks for credentials, you have two options:

**Option A: Personal Access Token**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Use token as password when pushing

**Option B: SSH Key (Better)**
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add to GitHub: Settings → SSH and GPG keys
3. Use SSH URL: `git@github.com:username/world-battle.git`

---

## What Gets Pushed

✅ All source code
✅ All commits (full history)
✅ All documentation
✅ Configuration files

❌ node_modules/ (gitignored)
❌ dist/ (gitignored)
❌ .env files (gitignored)

After cloning, just run `npm install` to get dependencies.
