from pathlib import Path
from PIL import Image, ImageDraw
R = Path(__file__).resolve().parents[1]
folder = R / 'artifacts/v0401/screens'
for size in ['360x640', '360x780', '412x915', '768x1024', '320x568']:
    paths = sorted(folder.glob(size + '-*.png'))
    thumb = (300, 540)
    for page, start in enumerate(range(0, len(paths), 12), 1):
        sheet = Image.new('RGB', (3 * 312, 4 * 570), (221, 230, 210))
        draw = ImageDraw.Draw(sheet)
        for i, p in enumerate(paths[start:start + 12]):
            im = Image.open(p).convert('RGB')
            im.thumbnail(thumb, Image.Resampling.LANCZOS)
            x, y = (i % 3) * 312 + 6, (i // 3) * 570 + 23
            sheet.paste(im, (x, y))
            draw.text((x, y - 17), p.stem[len(size) + 1:], fill=(30, 53, 40))
        sheet.save(folder / f'contact-{size}-{page}.png')
