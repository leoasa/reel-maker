# GitHub Repository Setup Instructions

Follow these steps to create a GitHub repository and push your Reel Maker application code:

## 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com/) and sign in to your account.
2. Click on the "+" icon in the top-right corner and select "New repository".
3. Enter "reel-maker" as the repository name.
4. Add a description: "A web application for creating synced music videos from multiple clips".
5. Choose "Public" or "Private" based on your preference.
6. Do NOT initialize the repository with a README, .gitignore, or license (since we already have these files locally).
7. Click "Create repository".

## 2. Push Your Code to GitHub

### Option 1: Use the provided script

Run the script we created:
```bash
./push_to_github.sh
```

### Option 2: Manual commands

If the script doesn't work, you can run these commands manually:
```bash
# Remove any existing remote named 'origin'
git remote remove origin

# Add your GitHub repository as the remote
git remote add origin https://github.com/leoasa/reel-maker.git

# Push your code to GitHub
git push -u origin main
```

## 3. Authentication

When pushing to GitHub, you'll be prompted for your GitHub username and password. Note that GitHub no longer accepts password authentication for Git operations. You'll need to use a personal access token instead:

1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click "Generate new token" and select "Generate new token (classic)"
3. Give your token a name (e.g., "Reel Maker Push")
4. Select the "repo" scope to allow access to your repositories
5. Click "Generate token"
6. Copy the token (you won't be able to see it again)
7. Use this token as your password when prompted during the git push

## 4. Verify Your Repository

After pushing your code, visit https://github.com/leoasa/reel-maker to verify that your repository has been created and your code has been pushed successfully. 