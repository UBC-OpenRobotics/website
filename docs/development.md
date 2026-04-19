# Development Guide

This site is a [Jekyll](https://jekyllrb.com/) static website for UBC Open Robotics. It is hosted on GitHub Pages and built from the `prod` branch. Day-to-day development happens on `main` and feature branches.

## Prerequisites

Install the following tools before getting started:

- **Ruby** 3.1 or newer (the CI uses 3.1; match this to avoid surprises)
- **Bundler** (`gem install bundler`)
- **Python** 3.x (only needed if you want to regenerate the recruitment positions locally)
- **Git**

On Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y ruby-full build-essential zlib1g-dev python3 python3-pip git
gem install --user-install bundler jekyll
```

On macOS (with Homebrew):

```bash
brew install ruby python git
gem install bundler jekyll
```

## Initial Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/UBC-OpenRobotics/website.git
   cd website
   ```

2. **Install Ruby dependencies**

   ```bash
   bundle install
   ```

   This reads the `Gemfile` and installs Jekyll 4.4.1, the Minima theme, and `jekyll-feed`.

3. **(Optional) Install Python dependencies**

   Only needed if you plan to regenerate the `_join/` position files locally:

   ```bash
   pip install pyyaml
   ```

## Running the Site Locally

Start the Jekyll dev server:

```bash
bundle exec jekyll serve
```

Or use the npm script shortcut:

```bash
npm run serve
```

The site will be available at **http://localhost:4000**. Jekyll watches for file changes and rebuilds automatically, so edits to pages, layouts, or collections appear after a refresh.

To do a one-off production-style build without the live server:

```bash
bundle exec jekyll build
# or
npm run build
```

The output is written to `_site/`.

> **Note:** Changes to `_config.yml` are **not** picked up by the watcher. Restart the server after editing it.

## Project Layout

```
web_opbot/
├── _config.yml          # Site-wide Jekyll config
├── _data/               # Global data (navigation, info)
├── _includes/           # Reusable HTML snippets
├── _layouts/            # Page templates
├── _pages/              # Top-level pages (join, learn, projects, roster, sponsors)
├── _projects/           # Project collection (each subfolder is a project)
├── _learn/              # Learn collection
├── _join/               # Generated recruitment positions (do not hand-edit)
├── assets/              # Images, CSS, JS
├── scripts/
│   └── fetch_positions.py   # Syncs positions from Google Sheets
├── index.markdown       # Homepage content
└── Gemfile              # Ruby dependencies
```

## Common Development Tasks

### Adding a new page

1. Create an HTML or Markdown file in `_pages/` (or at the repo root for top-level pages).
2. Include front matter at the top, for example:

   ```yaml
   ---
   layout: default
   title: My Page
   permalink: /my-page/
   ---
   ```

3. Add a link to `_data/navigation.yml` if you want it in the nav bar.

### Adding a new project

1. Create a new folder under `_projects/`, e.g. `_projects/my_project/`.
2. Add a Markdown file (e.g. `my_project.md`) with front matter:

   ```yaml
   ---
   layout: project-detail
   title: My Project
   status: active
   ---
   ```

3. Reference existing projects like `_projects/6dof_arm/` for structure.

Projects are a Jekyll collection defined in `_config.yml` and served at `/projects/:name/`.

### Marking a project as work-in-progress

Use the `wip` include to flag unfinished pages:

```liquid
{% include wip.html %}
```

### Editing the navigation

Edit `_data/navigation.yml`. The nav is rendered by `_includes/navigation.html`.

### Regenerating the recruitment positions locally

The `_join/` folder is auto-generated from a Google Sheet by GitHub Actions. To regenerate locally for testing:

```bash
python scripts/fetch_positions.py "YOUR_GOOGLE_SHEET_URL"
```

See [recruitment-setup.md](./recruitment-setup.md) for the full sheet format and column requirements.

## Development Workflow

1. Create a feature branch off `main`:

   ```bash
   git checkout main
   git pull
   git checkout -b my-feature
   ```

2. Make your changes and test locally with `bundle exec jekyll serve`.

3. Commit and push:

   ```bash
   git add .
   git commit -m "Describe your change"
   git push -u origin my-feature
   ```

4. Open a pull request against `main`. Once merged, the change is live in staging.

5. To ship to production, see [deployment.md](deployment.md).

## Troubleshooting

- **`bundle install` fails on native extensions** - ensure you have build tools (`build-essential` on Linux, Xcode command-line tools on macOS).
- **Port 4000 already in use** - run `bundle exec jekyll serve --port 4001`.
- **Changes don't appear** - you probably edited `_config.yml`; restart the server. Otherwise, hard-refresh the browser.
- **`bundle exec jekyll serve` is slow** - add `--incremental` for faster rebuilds during development.
- **Ruby version mismatch** - match CI's Ruby 3.1 to avoid gem compatibility issues.
