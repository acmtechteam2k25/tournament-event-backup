# GitHub Repository Setup Instructions

Follow these steps to create a new repository and push all your code.

## Step 1: Create a New Repository on GitHub

1. Go to [https://github.com/new](https://github.com/new)
2. Fill in the following:
   - **Repository name:** `tournament-event` (or your preferred name)
   - **Description:** `ACM VNRVJIET Tournament Management System - Tesseract 2K25`
   - **Visibility:** Choose "Public" or "Private" as needed
   - **Initialize this repository with:** Leave unchecked (we have code already)
3. Click **Create repository**
4. You'll see a page with setup instructions — copy the **HTTPS URL** (should look like `https://github.com/YOUR-USERNAME/tournament-event.git`)

## Step 2: Run These Commands

Replace `YOUR-REPO-URL` with the URL you copied from Step 1.

### Option A: Add as New Remote (Recommended if you want to keep current remote)

```powershell
# Add the new repository as a remote called 'github'
git remote add github YOUR-REPO-URL

# Push all branches to the new repository
git push -u github vennela-ui
git push -u github main

# Optional: Push all tags
git push -u github --tags
```

### Option B: Replace Current Remote (Start Fresh)

```powershell
# Remove the current remote
git remote remove origin

# Add the new repository as origin
git remote add origin YOUR-REPO-URL

# Push all branches
git push -u origin vennela-ui
git push -u origin main

# Optional: Push all tags
git push -u origin --tags
```

## Step 3: Verify the Push

Check that everything was pushed correctly:

```powershell
# View remote repositories
git remote -v

# You should see:
# github  https://github.com/YOUR-USERNAME/tournament-event.git (fetch)
# github  https://github.com/YOUR-USERNAME/tournament-event.git (push)
# 
# OR (if you used Option B):
# origin  https://github.com/YOUR-USERNAME/tournament-event.git (fetch)
# origin  https://github.com/YOUR-USERNAME/tournament-event.git (push)
```

Verify the branch was pushed by visiting: `https://github.com/YOUR-USERNAME/tournament-event/tree/vennela-ui`

---

## Important Information

### Your Current Git Status

**Current Branch:** `vennela-ui`  
**Last Commit:** feat: Green theme update with UI fixes and verification modal refinement  
**Commit Count:** 10 changed files  

### What Will Be Pushed

All commits and branches from your local repository, including:
- ✅ `vennela-ui` branch (current, with all changes)
- ✅ `main` branch (if it exists)
- ✅ All commit history
- ✅ All tags (if any)

### After Pushing

1. The new repository will have complete project code
2. You can clone it elsewhere using: `git clone YOUR-REPO-URL`
3. To update the local copy later: `git push github vennela-ui` (Option A) or `git push origin vennela-ui` (Option B)

---

## Complete Example

Here's a complete example with a real repository name:

```powershell
# Create new remote
git remote add github https://github.com/myusername/tournament-event.git

# Push all branches
git push -u github vennela-ui
git push -u github main

# Verify
git remote -v
```

After this, visit: `https://github.com/myusername/tournament-event/tree/vennela-ui`

---

## Troubleshooting

### Error: "fatal: not a git repository"
**Solution:** Run command in the project root: `C:\Users\kansa\OneDrive\Documents\Tech Tournament\tournament-event`

### Error: "remote already exists"
**Solution:** Either:
- Use a different name (e.g., `github` instead of `origin`)
- Or remove the existing remote first: `git remote remove origin`

### Error: "Authentication failed"
**Solution:** GitHub now requires personal access tokens. See: https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token

### Nothing happened after push
**Verify with:** 
```powershell
git log --oneline -5  # See last 5 commits
git branch -a  # See all branches
git remote -v  # See configured remotes
```

---

## Additional Commands

### Set default push behavior (optional)
```powershell
# After you've selected Option A or B, you can set the default:
git config --global push.default matching
```

### View what will be pushed before pushing
```powershell
git log origin/vennela-ui..vennela-ui --oneline
```

### Push specific branch only
```powershell
git push github vennela-ui:vennela-ui  # Push vennela-ui to github remote
```

---

## Summary

1. Create repo on GitHub
2. Copy the HTTPS URL
3. Run one of the Option A or B command sets above
4. Verify at `https://github.com/YOUR-USERNAME/tournament-event`

That's it! Your code will be on GitHub. 🚀
