# GitHub Upload Guide

## Step 1: Initialize Git Repository (if not already done)

```bash
cd /Users/parle/Documents/Projects/Github_repo_summarizer/GitHub_summarizer
git init
```

## Step 2: Add All Files

```bash
# Make sure .env files are ignored (they should be in .gitignore)
git add .
```

## Step 3: Create Initial Commit

```bash
git commit -m "Initial commit: GitHub Repository Summarizer"
```

## Step 4: Create Repository on GitHub

1. Go to https://github.com/new
2. Create a new repository:
   - **Repository name**: `github-repo-summarizer` (or your preferred name)
   - **Description**: "AI-powered GitHub repository analyzer and summarizer"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click "Create repository"

## Step 5: Connect Local Repository to GitHub

After creating the repository on GitHub, you'll see instructions. Use these commands:

```bash
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/github-repo-summarizer.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/github-repo-summarizer.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 6: Verify Upload

1. Go to your repository on GitHub
2. Verify all files are uploaded
3. Check that `.env` files are NOT visible (they should be ignored)

## Important Notes

### ⚠️ Security Checklist

Before pushing, verify these files are NOT in your repository:
- ✅ `.env` files (should be in .gitignore)
- ✅ `node_modules/` (should be in .gitignore)
- ✅ API keys or secrets

### 📝 Files to Update Before Upload

1. **README.md** - Update with your project description
2. **.env.example** - Create example files for users (already created)
3. **package.json** - Verify all dependencies are listed

### 🔐 Environment Variables

Users will need to:
1. Copy `.env.example` to `.env` in both `backend/` and `frontend/` directories
2. Add their own `GEMINI_API_KEY` in `backend/.env`

## Quick Commands Summary

```bash
# Navigate to project
cd /Users/parle/Documents/Projects/Github_repo_summarizer/GitHub_summarizer

# Initialize git (if needed)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: GitHub Repository Summarizer"

# Add remote (replace with your GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main
```

## Troubleshooting

### "Repository already exists"
- You might have initialized git in the parent directory
- Run: `cd GitHub_summarizer && git init`

### "Permission denied"
- Make sure you're authenticated with GitHub
- Use: `gh auth login` (if using GitHub CLI)
- Or set up SSH keys

### ".env files are showing"
- Check `.gitignore` includes `.env`
- Remove from git: `git rm --cached .env`
- Commit the change

