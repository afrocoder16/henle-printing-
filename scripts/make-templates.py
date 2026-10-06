"""Generate the downloadable artwork templates (PDF) for the Artwork Help Center.

Usage: python scripts/make-templates.py   (requires PyMuPDF)
Writes public/templates/henle-<id>-template.pdf. Sizes must match src/pages/tools/templateData.js.
"""
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'templates'
BLEED = 0.125
SAFE = 0.125
PT = 72

# id: (title, trim width in, trim height in, fold positions as fractions of width)
TEMPLATES = {
    'business-card': ('Business Card', 3.5, 2, []),
    'postcard-4x6': ('Postcard 4 × 6', 6, 4, []),
    'postcard-5x7': ('Postcard 5 × 7', 7, 5, []),
    'eddm-postcard': ('EDDM Postcard 6.5 × 9', 9, 6.5, []),
    'rack-card': ('Rack Card 4 × 9', 4, 9, []),
    'flyer-letter': ('Flyer / Letter 8.5 × 11', 8.5, 11, []),
    'trifold': ('Tri-fold Brochure (flat 11 × 8.5)', 11, 8.5, [1 / 3, 2 / 3]),
    'tabloid': ('Tabloid 11 × 17', 11, 17, []),
    'door-hanger': ('Door Hanger 4.25 × 11', 4.25, 11, []),
}

NAVY = (0.063, 0.165, 0.263)
RED = (0.945, 0.353, 0.29)
GREEN = (0.11, 0.54, 0.29)
CYAN = (0.0, 0.65, 0.78)


def make(key, title, w, h, folds):
    page_w, page_h = (w + 2 * BLEED) * PT, (h + 2 * BLEED) * PT
    doc = fitz.open()
    page = doc.new_page(width=page_w, height=page_h)
    b, s = BLEED * PT, SAFE * PT

    # Bleed zone (tinted), then the trim area (white)
    page.draw_rect(fitz.Rect(0, 0, page_w, page_h), color=None, fill=(1, 0.92, 0.9))
    trim = fitz.Rect(b, b, page_w - b, page_h - b)
    page.draw_rect(trim, color=None, fill=(1, 1, 1))

    # Safe zone (green, dashed)
    safe = fitz.Rect(trim.x0 + s, trim.y0 + s, trim.x1 - s, trim.y1 - s)
    page.draw_rect(safe, color=GREEN, width=1.2, dashes='[5 4] 0')
    # Trim line (solid)
    page.draw_rect(trim, color=NAVY, width=1.4)
    # Bleed edge (red)
    page.draw_rect(fitz.Rect(0.5, 0.5, page_w - 0.5, page_h - 0.5), color=RED, width=1.0)

    for fold in folds:
        x = trim.x0 + trim.width * fold
        page.draw_line((x, 0), (x, page_h), color=CYAN, width=1, dashes='[6 4] 0')
        page.insert_text((x + 4, trim.y0 + s + 10), 'FOLD', fontsize=7, color=CYAN, fontname='helv')

    cx = page_w / 2
    cy = page_h / 2
    big = max(8, min(16, trim.width / 14))
    for dy, text, size, color in [
        (-big * 1.6, title, big * 1.1, NAVY),
        (-big * 0.1, f'Trim size {w:g} × {h:g} in   ·   With bleed {w + 2 * BLEED:g} × {h + 2 * BLEED:g} in', big * 0.62, NAVY),
        (big * 1.0, 'Keep text and logos inside the green line', big * 0.62, GREEN),
        (big * 1.8, 'Extend backgrounds and photos to the red line', big * 0.62, RED),
        (big * 2.6, 'Hide or delete these guides before you export your PDF', big * 0.5, (0.4, 0.4, 0.4)),
    ]:
        length = fitz.get_text_length(text, fontname='helv', fontsize=size)
        if length > trim.width - 2 * s:
            size *= (trim.width - 2 * s) / length
            length = fitz.get_text_length(text, fontname='helv', fontsize=size)
        page.insert_text((cx - length / 2, cy + dy), text, fontsize=size, color=color, fontname='helv')

    # Legend, top-left inside the bleed
    legend = [('BLEED (red) 0.125 in', RED), ('TRIM (navy) final size', NAVY), ('SAFE (green) 0.125 in inside trim', GREEN)]
    y = b + s + 12
    for text, color in (legend if h >= 3.2 else []):
        page.draw_rect(fitz.Rect(safe.x0 + 4, y - 6, safe.x0 + 12, y + 2), color=None, fill=color)
        page.insert_text((safe.x0 + 18, y + 1), text, fontsize=6.5, color=NAVY, fontname='helv')
        y += 10

    page.insert_text((safe.x0 + 4, page_h - b - s - 6), 'Henle Printing Company · 703 Ontario Rd, Marshall, MN · 507-532-4493', fontsize=6, color=(0.4, 0.4, 0.4), fontname='helv')
    doc.set_metadata({'title': f'Henle template: {title}', 'author': 'Henle Printing Company'})
    path = OUT / f'henle-{key}-template.pdf'
    doc.save(path)
    print(path.relative_to(ROOT), f'{path.stat().st_size // 1024} KB')


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for key, spec in TEMPLATES.items():
        make(key, *spec)
