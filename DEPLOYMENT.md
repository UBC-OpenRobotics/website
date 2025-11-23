# Deploying to GitHub Pages

This site is very easy to deploy to GitHub Pages using GitHub Actions. Everything is automated!

## How It Works

The deployment workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) automatically:

1. ✅ Installs Node.js dependencies
2. ✅ Builds React/TypeScript bundle with Vite
3. ✅ Installs Ruby/Jekyll dependencies
4. ✅ Builds Jekyll site (which includes the React bundle)
5. ✅ Deploys to GitHub Pages

## One-Time Setup

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/UBC-OpenRobotics/website
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
4. Save

That's it! No other configuration needed.

### Step 2: Create and Push to Production Branch

The workflow is configured to deploy from the `prod` branch. This keeps your production deployments separate from development work.

**Create the prod branch:**
```bash
# If you don't have a prod branch yet
git checkout -b prod

# Or if prod already exists, switch to it
git checkout prod

# Merge your changes
git merge your-branch

# Push to trigger deployment
git push origin prod
```

**Workflow:**
- Work on feature branches
- Merge to `main` for staging/testing
- Merge to `prod` when ready to deploy to production

## Deploying

Once setup is complete, deployment is **automatic**:

```bash
# Just commit and push!
git add .
git commit -m "Add React + TypeScript support"
git push
```

The GitHub Actions workflow will:
- Automatically trigger on push
- Build everything
- Deploy to GitHub Pages
- Your site will be live at: `https://ubc-openrobotics.github.io/website/`

## Viewing Build Status

1. Go to the **Actions** tab in your repository
2. You'll see the "Deploy to GitHub Pages" workflow running
3. Click on it to see detailed logs
4. Build typically takes 2-3 minutes

## Local Testing Before Deploy

Always test locally before pushing:

```bash
# Build React
npm run build

# Test with Jekyll
npm run jekyll:serve

# Visit http://localhost:4000
```

## Troubleshooting

### Build Fails

**Check the Actions tab** for error logs. Common issues:

- **Missing dependencies**: Make sure `package-lock.json` is committed (it's in .gitignore, you may need to remove it from there temporarily for the first deploy)
- **Ruby version**: Workflow uses Ruby 3.1 (matches most GitHub Pages setups)
- **Node version**: Workflow uses Node 20

### Site Not Updating

- Clear browser cache
- Wait 2-3 minutes after deployment completes
- Check the Actions tab to ensure deployment succeeded

## Custom Domain

To use a custom domain:

1. Add `CNAME` file to repository root:
   ```
   yourdomain.com
   ```
2. Configure DNS with your domain provider
3. Enable "Enforce HTTPS" in repository Settings → Pages

## Notes

- First deployment may take longer (~3-5 minutes)
- Subsequent deployments are faster (~2-3 minutes)
- GitHub Pages caches aggressively - use hard refresh (Ctrl+Shift+R) to see changes
- The React bundle is built fresh on every deployment, ensuring you always have the latest code
