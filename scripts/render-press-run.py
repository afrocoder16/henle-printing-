"""Cut the five Press Run pieces from the rendered portfolio pages and split each into CMYK plates.

Usage: python scripts/render-press-run.py   (run scripts/render-portfolio.py first; needs Pillow + numpy)

Writes public/press-run/<id>.webp (full color) and <id>-c|m|y|k.webp (one ink each, alpha = ink coverage).
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / 'public' / 'portfolio' / 'pages'
OUT = ROOT / 'public' / 'press-run'
MAX_SIDE = 1400

# id: (page, crop box on the 2200px-wide HD render, optional areas to paint white first)
PIECES = {
    'brigadoon': (20, (108, 1738, 1348, 2592), []),
    'county-fair': (6, (316, 1492, 1964, 2684), [(985, 1596, 1944, 1742)]),
    'farm-management': (13, (136, 92, 2108, 1328), []),
    'fall-guide': (18, (136, 1524, 860, 2632), []),
    'go-fish': (17, (0, 70, 2200, 864), [(1300, 60, 1920, 236)]),
}

INKS = {'c': (0, 174, 239), 'm': (236, 0, 140), 'y': (255, 236, 0), 'k': (35, 31, 32)}


def separate(img):
    rgb = np.asarray(img, dtype=np.float32) / 255
    k = 1 - rgb.max(axis=2)
    room = np.clip(1 - k, 1e-4, None)
    plates = {
        'c': (1 - rgb[..., 0] - k) / room,
        'm': (1 - rgb[..., 1] - k) / room,
        'y': (1 - rgb[..., 2] - k) / room,
        'k': k,
    }
    for name, amount in plates.items():
        alpha = (np.clip(amount, 0, 1) * 255).astype(np.uint8)
        layer = np.empty((*alpha.shape, 4), dtype=np.uint8)
        layer[..., :3] = INKS[name]
        layer[..., 3] = alpha
        yield name, Image.fromarray(layer, 'RGBA')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for piece, (page, box, whiteouts) in PIECES.items():
        img = Image.open(PAGES / f'p{page:02d}-hd.webp').convert('RGB')
        draw = ImageDraw.Draw(img)
        for area in whiteouts:
            draw.rectangle(area, fill='white')
        img = img.crop(box)
        img.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
        img.save(OUT / f'{piece}.webp', 'WEBP', quality=84, method=6)
        for name, layer in separate(img):
            layer.save(OUT / f'{piece}-{name}.webp', 'WEBP', quality=80, method=6)
        sizes = sum((OUT / f'{piece}{s}.webp').stat().st_size for s in ['', '-c', '-m', '-y', '-k']) // 1024
        print(f'{piece}: {img.width}x{img.height}, {sizes} KB total')


if __name__ == '__main__':
    main()
