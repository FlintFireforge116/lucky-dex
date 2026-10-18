from pathlib import Path
from PIL import Image, ImageDraw
R = Path(__file__).resolve().parents[1] / 'artifacts/v0423/visual'
files = sorted(R.glob('*.png'))
files = [p for p in files if not p.name.startswith('contact-')]
for start in range(0, len(files), 24):
    sheet = Image.new('RGB', (840, 1360), '#152330')
    draw = ImageDraw.Draw(sheet)
    for index, p in enumerate(files[start:start+24]):
        x, y = (index % 6) * 140, (index // 6) * 340
        with Image.open(p) as src:
            src.thumbnail((136, 310))
            sheet.paste(src, (x + (140-src.width)//2, y+20))
        draw.text((x+2, y+2), p.stem[:24], fill='#ecddab')
    target = R / f'contact-{start//24+1}.png'
    sheet.save(target)
    print(target)
