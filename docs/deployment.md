# Deployment Guide

The UBC Open Robotics website is deployed to GitHub Pages automatically via GitHub Actions. The live site is served from **https://openrobotics.ca** and backed by the GitHub Pages deployment at `https://ubc-openrobotics.github.io/website/`.

## Deployment Model

- **`main`** - Active development. All feature branches merge here via pull request.
- **`prod`** - Production. A push to this branch triggers a GitHub Pages deploy.

This separation means nothing reaches the public site until it has been explicitly promoted from `main` to `prod`.

## How It Works

The deployment is driven by two workflows in `.github/workflows/`:

1. **`deploy.yml`** - triggered on pushes to `prod`. It:
   1. Checks out the `prod` branch
   2. Sets up Ruby 3.1 and Python 3.x
   3. Installs the Python `pyyaml` dependency
   4. Runs `scripts/fetch_positions.py` to pull the latest recruitment positions from Google Sheets (using the `POSITIONS_SHEET_URL` repository secret)
   5. Builds the Jekyll site with `bundle exec jekyll build` (with `JEKYLL_ENV=production`)
   6. Uploads the generated `_site/` as a Pages artifact
   7. Deploys the artifact to GitHub Pages

2. **`update-prod.yml`** - a manually triggered workflow (`workflow_dispatch`) that merges `main` into `prod` and pushes. Running this is equivalent to promoting the current state of `main` to production.

## One-Time Repository Setup

These steps only need to be done once per repository. If you are a contributor deploying existing work, skip to [Deploying to Production](#deploying-to-production).

### 1. Enable GitHub Pages

1. Go to the repository: https://github.com/UBC-OpenRobotics/website
2. Navigate to **Settings → Pages**
3. Under **Build and deployment**, set **Source** to **GitHub Actions**
4. Save

### 2. Create the `prod` branch

If `prod` does not exist yet:

```bash
git checkout main
git pull
git checkout -b prod
git push -u origin prod
```

### 3. Configure the recruitment positions secret

The deploy workflow fetches open positions from a Google Sheet. Add the secret:

1. Navigate to **Settings > Secrets and variables > Actions**
2. Click **New repository secret**
3. Name: `POSITIONS_SHEET_URL`
4. Value: the full Google Sheet URL (the sheet must be publicly viewable)
5. Save

See [recruitment-setup.md](../recruitment-setup.md) for the expected sheet format. If you skip this, the build will fail at the "Fetch positions" step.

### 4. (Optional) Configure a custom domain

The site is served at `https://openrobotics.ca`. To change the domain:

1. Add a `CNAME` file at the repo root containing the domain name
2. Configure the DNS records with your registrar to point at GitHub Pages
3. Enable **Enforce HTTPS** under **Settings → Pages**
4. Update `url:` in `_config.yml` to match

## Deploying to Production

There are two supported ways to deploy. Both end with a push to `prod`, which triggers `deploy.yml`.

### Option A - Promote `main` via the GitHub Action (recommended)

Use this when `main` already contains everything you want live.

1. Go to the **Actions** tab
2. Select **Update Prod from Main**
3. Click **Run workflow --> Run workflow**

This merges `main` into `prod` with a merge commit and pushes it. The `deploy.yml` workflow will then start automatically.

### Option B - Manually merge and push

Use this if you want to deploy something that is not on `main` (e.g. a hotfix branch).

```bash
git checkout prod
git pull
git merge main          # or any other branch you want to ship
git push origin prod
```

### Option C - Manually trigger the deploy without merging

If `prod` is already at the commit you want deployed and you just want to re-run the build (for example, to refresh the recruitment positions):

1. Go to the **Actions** tab
2. Select **Deploy to GitHub Pages**
3. Click **Run workflow**, pick the `prod` branch, and run

## Verifying the Deployment

1. Go to the **Actions** tab and watch the **Deploy to GitHub Pages** run. Builds usually take 2–3 minutes.
2. Once the `deploy` job shows a green check, the site is live.
3. Open https://openrobotics.ca (or `https://ubc-openrobotics.github.io/website/` if using the default domain) and hard-refresh (Ctrl+Shift+R / Cmd+Shift+R) to bypass the CDN cache.

## Pre-Deployment Checklist

Before promoting to `prod`:

- [ ] Build locally: `bundle exec jekyll build` succeeds with no warnings you didn't expect
- [ ] Serve locally: `bundle exec jekyll serve` and click through the affected pages
- [ ] Navigation still works on every top-level page
- [ ] Any new project page appears at `/projects/<name>/`
- [ ] Images and assets load (check the browser console for 404s)
- [ ] `_config.yml`'s `url` and `baseurl` are correct for the target domain

## Rolling Back

If a bad deploy hits production:

1. Identify the last known-good commit on `prod` (check `git log prod`).
2. Revert on `prod`:

   ```bash
   git checkout prod
   git pull
   git revert <bad-commit-sha>   # preserves history - preferred
   git push origin prod
   ```

   Or, if the bad state is a merge you want to undo entirely:

   ```bash
   git checkout prod
   git reset --hard <good-commit-sha>
   git push --force-with-lease origin prod
   ```

   Force-pushing to `prod` is destructive - only do it if a revert is not viable, and coordinate with the team first.

3. The push triggers `deploy.yml` and the site returns to the good state within a few minutes.

## Troubleshooting

### The build failed at "Fetch positions from Google Sheets"

- Confirm the `POSITIONS_SHEET_URL` secret is set
- Confirm the Google Sheet is shared as **Anyone with the link: Viewer**
- Open the sheet URL in an incognito window to verify public access
- Check that the sheet's columns match the format in [recruitment-setup.md](../recruitment-setup.md)

### The build failed at "Build Jekyll site"

- Reproduce locally with `JEKYLL_ENV=production bundle exec jekyll build`
- Look for Liquid syntax errors, missing front matter, or bad collection entries
- Mismatched Ruby versions can cause native-gem failures - CI uses Ruby 3.1

### The workflow runs but the site doesn't update

- Confirm the workflow ran on the `prod` branch, not `main`
- Wait 2-3 minutes after the deploy finishes for Pages' CDN to propagate
- Hard-refresh (Ctrl+Shift+R) to bypass the browser cache
- Check **Settings → Pages** - the deployment source must be **GitHub Actions**

### `bundle install` fails in CI

- `Gemfile.lock` may be out of date or incompatible with Ruby 3.1. Regenerate locally using Ruby 3.1 and commit the updated lockfile.

## Related Docs

- [Development guide](development.md) - how to run and work on the site locally
- [Recruitment setup](../recruitment-setup.md) - Google Sheets integration for the `/join/` page
- [Legacy DEPLOYMENT.md](../DEPLOYMENT.md) - older deployment notes (kept for reference)
