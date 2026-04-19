# Recruitment Positions Setup Guide

This guide will help you set up the automated recruitment positions system that syncs with Google Sheets.

## Quick Start

### Step 1: Create Your Google Sheet

1. Create a new Google Sheet or use an existing one
2. Set up the following columns (first row as headers):

| Position | Quantity | Form Link | Description |
|----------|----------|-----------|-------------|
| Software Developer | 2 | https://forms.google.com/d/YOUR_FORM_ID/viewform | Help build innovative robotics software solutions. |
| Mechanical Engineer | 1 | https://forms.google.com/d/YOUR_FORM_ID/viewform | Design and prototype robotic mechanisms. |

**Important:**
- Only positions with `Quantity > 0` will be displayed
- `Description` is optional
- Make sure column names match exactly (case-sensitive)

### Step 2: Make the Sheet Public

1. Click **Share** (top-right corner)
2. Click **Change to anyone with the link**
3. Set permissions to **Viewer**
4. Copy the sheet URL (it should look like: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=0`)

### Step 3: Add GitHub Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter:
   - **Name:** `POSITIONS_SHEET_URL`
   - **Secret:** (paste your Google Sheet URL)
5. Click **Add secret**

### Step 4: Trigger the Workflow

**Option A - Wait for automatic update:**
The workflow runs automatically every 6 hours.

**Option B - Manual trigger:**
1. Go to **Actions** tab
2. Select **Update Recruitment Positions**
3. Click **Run workflow** → **Run workflow**

## How It Works

```
Google Sheet (you edit)
    ↓
GitHub Actions (fetches every 6 hours)
    ↓
_join/ directory (generated .md files)
    ↓
/join/ page (displays positions)
```

## Local Testing

Test the script locally before pushing:

```bash
# Install dependencies
pip install pyyaml

# Run the script
python scripts/fetch_positions.py "YOUR_GOOGLE_SHEET_URL"

# Check generated files
ls -la _join/

# Test with Jekyll
bundle exec jekyll serve
```

Visit `http://localhost:4000/join/` to see the positions.

## Google Forms Setup

For each position, create a Google Form:

1. Go to [Google Forms](https://forms.google.com)
2. Create a new form for applications
3. Add fields like:
   - Name
   - Email
   - Student ID (if applicable)
   - Position applying for
   - Resume/CV (file upload)
   - Why you're interested
4. Click **Send** → Get link
5. Copy this link to your Google Sheet's **Form Link** column

## Updating Positions

To update positions, simply edit your Google Sheet:

- **Add a position:** Add a new row
- **Remove a position:** Set Quantity to 0 or delete the row
- **Update details:** Edit the cells directly

Changes will appear on the website within 6 hours (or immediately if you trigger the workflow manually).

## File Structure

```
web_opbot/
├── _join/                          # Generated position files
│   ├── 01-software-developer.md
│   ├── 02-mechanical-engineer.md
│   └── README.md
├── _pages/
│   └── join.html                   # Main join page
├── scripts/
│   └── fetch_positions.py          # Google Sheets sync script
└── .github/
    └── workflows/
        └── update-positions.yml    # Automation workflow
```

## Troubleshooting

### Positions not showing up?

1. **Check the Google Sheet is public:**
   - Open the sheet URL in an incognito window
   - You should be able to view it without signing in

2. **Verify the secret is set:**
   - Go to Settings → Secrets → Actions
   - Confirm `POSITIONS_SHEET_URL` exists

3. **Check workflow logs:**
   - Go to Actions tab
   - Click on the latest workflow run
   - Review the logs for errors

4. **Verify column names:**
   - Sheet must have: Position, Quantity, Form Link, Description
   - Names are case-sensitive

### Workflow failed?

Common issues:
- **Sheet not public:** Make it viewable to anyone with the link
- **Invalid URL:** Use the full Google Sheets URL with `/edit` or `/export`
- **Missing PyYAML:** The workflow auto-installs it, but check logs

### Changes not appearing?

- Wait a few minutes for Jekyll to rebuild (if deployed)
- Clear your browser cache
- Check that Quantity > 0 in the sheet
- Verify the workflow completed successfully

## Advanced Configuration

### Customize Update Frequency

Edit [.github/workflows/update-positions.yml](.github/workflows/update-positions.yml):

```yaml
on:
  schedule:
    - cron: '0 */6 * * *'  # Change this (currently every 6 hours)
```

Cron examples:
- `0 */3 * * *` - Every 3 hours
- `0 9 * * *` - Daily at 9 AM
- `0 9 * * 1` - Every Monday at 9 AM

### Customize the Display

Edit [_pages/join.html](_pages/join.html) to modify:
- Colors and styling
- Card layout
- Button text
- Empty state message

## Support

For issues or questions:
1. Review workflow logs in the Actions tab
2. Test locally using the script
