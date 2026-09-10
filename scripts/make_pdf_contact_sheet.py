from pathlib import Path
import sys
from PIL import Image, ImageDraw


def main() -> None:
    src = Path(sys.argv[1])
    out = Path(sys.argv[2])
    files = sorted(src.glob("page-*.png"))
    thumb_w, thumb_h = 384, 216
    gap, label_h = 18, 28
    cols = 3
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * thumb_w + (cols + 1) * gap, rows * (thumb_h + label_h) + (rows + 1) * gap), "#dfe5ec")
    draw = ImageDraw.Draw(sheet)
    for i, file in enumerate(files):
        with Image.open(file) as page:
            page = page.convert("RGB")
            page.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
            x = gap + (i % cols) * (thumb_w + gap)
            y = gap + (i // cols) * (thumb_h + label_h + gap)
            sheet.paste(page, (x, y))
            draw.text((x, y + thumb_h + 5), f"PAGE {i + 1:02d}", fill="#0b2545")
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, quality=92)


if __name__ == "__main__":
    main()
