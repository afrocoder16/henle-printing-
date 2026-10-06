"""Render the curated portfolio pages and shop photos from Henle's 2023 portfolio PDF.

Usage: python scripts/render-portfolio.py   (requires PyMuPDF and Pillow)

Writes WebP images to public/portfolio/. Page numbers must match src/portfolioData.js.
"""
import io
from pathlib import Path

import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / 'public' / 'assets' / 'Portfolio+2023_online.pdf'
OUT = ROOT / 'public' / 'portfolio'

PAGES = [5, 6, 7, 11, 12, 13, 17, 18, 19, 20, 21, 23]
SIZES = {'': 1100, '-hd': 2200, '-thumb': 360}

# Full-bleed photos that sit underneath the section divider pages.
PHOTOS = {4: 'mailroom', 8: 'cutter', 14: 'press', 16: 'finishing'}


def save(img, path, quality):
    img.save(path, 'WEBP', quality=quality, method=6)
    print(f'{path.relative_to(ROOT)}  {img.width}x{img.height}  {path.stat().st_size // 1024} KB')


def main():
    (OUT / 'pages').mkdir(parents=True, exist_ok=True)
    (OUT / 'photos').mkdir(parents=True, exist_ok=True)
    doc = fitz.open(PDF)

    for number in PAGES:
        page = doc[number - 1]
        scale = SIZES['-hd'] / page.rect.width
        pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
        full = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        for suffix, width in SIZES.items():
            img = full if width == full.width else full.resize((width, round(full.height * width / full.width)), Image.LANCZOS)
            save(img, OUT / 'pages' / f'p{number:02d}{suffix}.webp', 82 if suffix == '-hd' else 80)

    for number, name in PHOTOS.items():
        xref = doc[number - 1].get_images(full=True)[0][0]
        img = Image.open(io.BytesIO(doc.extract_image(xref)['image'])).convert('RGB')
        img.thumbnail((1400, 1400), Image.LANCZOS)
        save(img, OUT / 'photos' / f'{name}.webp', 78)


if __name__ == '__main__':
    main()
