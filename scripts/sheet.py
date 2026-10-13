"""Tile the frames from scripts/shoot.mjs into one contact sheet: python3 scripts/sheet.py lab/desktop [cols] [thumb_width]"""
import glob
import os
import sys

from PIL import Image, ImageDraw

folder = sys.argv[1]
cols = int(sys.argv[2]) if len(sys.argv) > 2 else 4
tw = int(sys.argv[3]) if len(sys.argv) > 3 else 440
files = sorted(f for f in glob.glob(os.path.join(folder, '*.png')) if not f.endswith('sheet.png'))
first = Image.open(files[0])
th = int(first.height * tw / first.width)
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 8), rows * (th + 24)), 'white')
draw = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((tw, th))
    x, y = (i % cols) * (tw + 8), (i // cols) * (th + 24)
    sheet.paste(im, (x, y))
    draw.text((x + 4, y + th + 5), os.path.basename(f), fill='black')
sheet.save(os.path.join(folder, 'sheet.png'))
print(os.path.join(folder, 'sheet.png'))
