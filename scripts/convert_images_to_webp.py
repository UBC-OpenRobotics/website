#!/usr/bin/env python3
"""
Post-build step: convert every PNG/JPG/JPEG under _site/ to WebP and rewrite
references to those images in HTML/CSS/MD files.

Originals are deleted after successful conversion so the deployed artifact
only ships WebP.
"""

import re
import sys
import time
from pathlib import Path

from PIL import Image

SITE_DIR = Path("_site")
IMAGE_EXTS = {".png", ".jpg", ".jpeg"}
REWRITE_EXTS = {".html", ".css", ".md"}

# Match an image extension followed by a delimiter that indicates the
# extension is at the end of a path/URL token (quote, whitespace, closing
# paren/bracket, query string, fragment, or end-of-line).
REF_PATTERN = re.compile(r"\.(png|jpe?g)(?=[\"'\s\)\]\?\#]|$)", re.IGNORECASE)


def human_size(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024 or unit == "GB":
            return f"{n:.1f}{unit}" if unit != "B" else f"{n}B"
        n /= 1024
    return f"{n:.1f}GB"


def convert_image(path: Path) -> tuple[bool, int, int]:
    """Return (ok, original_bytes, webp_bytes)."""
    webp_path = path.with_suffix(".webp")
    original_bytes = path.stat().st_size
    try:
        with Image.open(path) as img:
            mode = img.mode
            size = img.size
            save_kwargs = {"quality": 85, "method": 6}
            if mode in ("RGBA", "LA", "P"):
                img.save(webp_path, "WEBP", lossless=False, **save_kwargs)
            else:
                img.save(webp_path, "WEBP", **save_kwargs)
        webp_bytes = webp_path.stat().st_size
        path.unlink()
        rel = path.relative_to(SITE_DIR)
        saved = original_bytes - webp_bytes
        pct = (saved / original_bytes * 100) if original_bytes else 0
        print(
            f"  [ok] {rel}  ({size[0]}x{size[1]} {mode})  "
            f"{human_size(original_bytes)} -> {human_size(webp_bytes)}  "
            f"(-{pct:.1f}%)"
        )
        return True, original_bytes, webp_bytes
    except Exception as e:
        print(f"  [FAIL] {path}: {e}", file=sys.stderr)
        if webp_path.exists():
            webp_path.unlink()
        return False, original_bytes, 0


def rewrite_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    new_text, count = REF_PATTERN.subn(".webp", text)
    if count:
        path.write_text(new_text, encoding="utf-8")
        rel = path.relative_to(SITE_DIR)
        print(f"  [rewrite] {rel}  ({count} reference{'s' if count != 1 else ''})")
    return count


def main() -> int:
    print(f"=== WebP conversion: scanning {SITE_DIR}/ ===")
    if not SITE_DIR.is_dir():
        print(
            f"error: {SITE_DIR} not found — run after `jekyll build`",
            file=sys.stderr,
        )
        return 1

    images = [
        p for p in SITE_DIR.rglob("*")
        if p.is_file() and p.suffix.lower() in IMAGE_EXTS
    ]
    print(f"found {len(images)} image(s) to convert")

    t0 = time.perf_counter()
    converted = 0
    failed = 0
    total_original = 0
    total_webp = 0
    for img in images:
        ok, orig_sz, webp_sz = convert_image(img)
        if ok:
            converted += 1
            total_original += orig_sz
            total_webp += webp_sz
        else:
            failed += 1
    elapsed = time.perf_counter() - t0
    saved = total_original - total_webp
    pct = (saved / total_original * 100) if total_original else 0
    print(
        f"\nconversion summary: {converted} ok, {failed} failed  "
        f"in {elapsed:.2f}s"
    )
    print(
        f"  size: {human_size(total_original)} -> {human_size(total_webp)}  "
        f"(saved {human_size(saved)}, -{pct:.1f}%)"
    )

    print(f"\n=== Rewriting references in {sorted(REWRITE_EXTS)} ===")
    docs = [
        p for p in SITE_DIR.rglob("*")
        if p.is_file() and p.suffix.lower() in REWRITE_EXTS
    ]
    print(f"scanning {len(docs)} file(s)")

    t1 = time.perf_counter()
    rewritten_files = 0
    total_refs = 0
    for doc in docs:
        n = rewrite_file(doc)
        if n:
            rewritten_files += 1
            total_refs += n
    elapsed = time.perf_counter() - t1
    print(
        f"\nrewrite summary: {total_refs} reference(s) across "
        f"{rewritten_files} file(s) in {elapsed:.2f}s"
    )

    if failed:
        print(f"\n!! {failed} image(s) failed to convert — see errors above")
        return 1
    print("\nall done")
    return 0


if __name__ == "__main__":
    sys.exit(main())
