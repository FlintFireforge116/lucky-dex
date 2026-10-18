"""Compose already captured phone screenshots for visual review; no app changes."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1] / 'qa/v0440/ui'
names = ['free', 'physical', 'physical-detail', 'pocket', 'pocket-detail',
         'locked', 'hidden', 'hidden-detail', 'originals', 'default-detail',
         'equipped', 'search']
for width in [320, 360, 393, 412]:
    thumb_width, cell_height = 236, 580
    canvas = Image.new('RGB', (thumb_width * 6, cell_height * 2), '#17202b')
    draw = ImageDraw.Draw(canvas)
    for index, name in enumerate(names):
        img = Image.open(root / f'{width}-{name}.png').convert('RGB')
        img.thumbnail((thumb_width - 8, cell_height - 26))
        x, y = (index % 6) * thumb_width, (index // 6) * cell_height
        draw.text((x + 5, y + 4), f'{width}px / {name}', fill='white')
        canvas.paste(img, (x + (thumb_width - img.width) // 2, y + 24))
    canvas.save(root / f'{width}-contact-sheet.jpg', quality=92)
print('Wrote four phone contact sheets')
