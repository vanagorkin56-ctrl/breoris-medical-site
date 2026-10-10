"""Repair the recording's blank-area seam and clipped decorative dot in decoded PNG frames.
Input/output directories are arguments; geometry refers to the original 1440x816 film.
Does not change the ECG, timing, branding, or the other animated shapes.
"""
from pathlib import Path
import sys
from PIL import Image, ImageDraw
source, target = map(Path, sys.argv[1:3])
target.mkdir(parents=True, exist_ok=True)
for path in sorted(source.glob('frame-*.png')):
    im = Image.open(path).convert('RGB')
    # A stale rectangular caption patch left a line across otherwise empty background.
    # Copy the clean adjacent row, preserving the slight horizontal colour variation.
    im.paste(im.crop((280, 625, 1150, 626)).resize((870, 24)), (280, 636))
    # Restore the small lower turquoise circle clipped by the old CTA cleanup rectangle.
    points = []
    for y in range(690, 795):
        for x in range(490, 585):
            r, g, b = im.getpixel((x, y))
            if g-r > 35 and b-r > 35 and g > 140:
                points.append((x, y))
    if points:
        x0, x1 = min(x for x,y in points), max(x for x,y in points)
        y0, y1 = min(y for x,y in points), max(y for x,y in points)
        if 35 < x1-x0 < 65 and 35 < y1-y0 < 65:
            cx, cy = (x0+x1)/2, (y0+y1)/2
            color = im.getpixel((round(cx), round(cy)))
            mask = Image.new('L', (1440*2, 816*2))
            ImageDraw.Draw(mask).ellipse((x0*2,y0*2,(x1+1)*2,(y1+1)*2), fill=255)
            mask = mask.resize(im.size, Image.Resampling.LANCZOS)
            im.paste(color, (0,0,1440,816), mask)
    im.save(target/path.name)
