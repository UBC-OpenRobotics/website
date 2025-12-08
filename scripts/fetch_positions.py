#!/usr/bin/env python3
"""
Fetch open positions from Google Sheets and generate Jekyll collection files.
"""

import os
import sys
import csv
import urllib.request
import yaml
from pathlib import Path

def fetch_google_sheet_csv(sheet_url):
    """
    Fetch Google Sheet as CSV.
    Sheet URL should be in format: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit#gid={GID}
    or the export URL: https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}
    """
    # Convert view URL to export URL if needed
    if '/edit' in sheet_url:
        # Extract sheet ID
        if '/d/' in sheet_url:
            sheet_id = sheet_url.split('/d/')[1].split('/')[0]
            # Extract gid if present
            gid = '0'
            if 'gid=' in sheet_url:
                gid = sheet_url.split('gid=')[1].split('&')[0].split('#')[0]

            sheet_url = f'https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}'

    print(f"Fetching data from: {sheet_url}")

    try:
        with urllib.request.urlopen(sheet_url) as response:
            content = response.read().decode('utf-8')
            return content
    except Exception as e:
        print(f"Error fetching Google Sheet: {e}", file=sys.stderr)
        sys.exit(1)

def parse_positions(csv_content):
    """
    Parse CSV content and return list of positions.
    Expected columns: Position, Quantity, Form Link, Description (optional)
    """
    positions = []
    reader = csv.DictReader(csv_content.splitlines())

    for row in reader:
        if not row.get('Position') or not row.get('Position').strip():
            continue

        position = {
            'title': row.get('Position', '').strip(),
            'quantity': int(row.get('Quantity', '0')),
            'form_link': row.get('Form Link', '').strip(),
            'description': row.get('Description', '').strip(),
            'project' : row.get('Project', '').strip()
        }

        if position['quantity'] > 0:
            positions.append(position)

    return positions

def generate_position_files(positions, output_dir):
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # WARNING, THIS CLEARS THE EXISTING _join DIRECTORY'S MD CONTENTS
    for file in output_path.glob('*.md'):
        file.unlink()

    for idx, position in enumerate(positions):
        # filename-safe slug
        slug = position['title'].lower().replace(' ', '-').replace('/', '-')
        filename = f"{idx+1:02d}-{slug}.md"
        filepath = output_path / filename

        frontmatter = {
            'title': position['title'],
            'quantity': position['quantity'],
            'form_link': position['form_link'],
            'project' : position['project'],
            'order': idx + 1
        }

        with open(filepath, 'w') as f:
            f.write('---\n')
            f.write(yaml.dump(frontmatter, default_flow_style=False, allow_unicode=True))
            f.write('---\n')
            if position['description']:
                f.write('\n')
                f.write(position['description'])
                f.write('\n')

        print(f"Created: {filename}")

    print(f"\nGenerated {len(positions)} position files in {output_dir}")

def main():
    sheet_url = os.environ.get('GOOGLE_SHEET_URL') # Github secret env var

    if len(sys.argv) > 1:
        sheet_url = sys.argv[1]

    if not sheet_url:
        print("Error: Please provide Google Sheet URL", file=sys.stderr)
        print("Usage: python fetch_positions.py <GOOGLE_SHEET_URL>", file=sys.stderr)
        print("Or set GOOGLE_SHEET_URL environment variable", file=sys.stderr)
        sys.exit(1)

    csv_content = fetch_google_sheet_csv(sheet_url)
    positions = parse_positions(csv_content)

    if not positions:
        print("Warning: No open positions found (quantity > 0)")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_top_dir = os.path.dirname(script_dir)
    output_dir = os.path.join(project_top_dir, '_join')
    generate_position_files(positions, output_dir)

if __name__ == '__main__':
    main()
