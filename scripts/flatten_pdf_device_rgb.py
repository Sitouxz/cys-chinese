"""Flatten rendered PDF pages into a transparency-free DeviceRGB PDF."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


PAGE_WIDTH_PT = 960
PAGE_HEIGHT_PT = 540


def is_pink(r: int, g: int, b: int) -> bool:
    return (
        r > 180
        and r >= g + 3
        and r >= b + 8
        and max(r, g, b) - min(r, g, b) < 55
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input_dir", type=Path)
    parser.add_argument("output_pdf", type=Path)
    parser.add_argument("--quality", type=int, default=96)
    args = parser.parse_args()

    page_paths = sorted(args.input_dir.glob("page-*.png"))
    if not page_paths:
        raise SystemExit(f"No page PNGs found in {args.input_dir}")

    rgb_dir = args.input_dir / "device-rgb"
    rgb_dir.mkdir(parents=True, exist_ok=True)
    args.output_pdf.parent.mkdir(parents=True, exist_ok=True)

    pdf = canvas.Canvas(
        str(args.output_pdf),
        pagesize=(PAGE_WIDTH_PT, PAGE_HEIGHT_PT),
        pageCompression=1,
        invariant=1,
    )
    pdf.setTitle("CYS Chinese Website - Design Brief - No Pink")

    total_pixels = 0
    pink_pixels = 0

    for index, page_path in enumerate(page_paths, start=1):
        with Image.open(page_path) as source:
            rgb = source.convert("RGB")
            pixels = np.asarray(rgb, dtype=np.uint8)
            red = pixels[:, :, 0].astype(np.int16)
            green = pixels[:, :, 1].astype(np.int16)
            blue = pixels[:, :, 2].astype(np.int16)
            spread = pixels.max(axis=2).astype(np.int16) - pixels.min(axis=2).astype(np.int16)
            pink_mask = (
                (red > 180)
                & (red >= green + 3)
                & (red >= blue + 8)
                & (spread < 55)
            )
            page_pink = int(pink_mask.sum())
            total_pixels += int(pixels.shape[0] * pixels.shape[1])
            pink_pixels += page_pink
            if page_pink:
                raise SystemExit(
                    f"Pink audit failed on {page_path.name}: {page_pink} pixels"
                )

            flattened_path = rgb_dir / f"page-{index:02d}.jpg"
            rgb.save(
                flattened_path,
                format="JPEG",
                quality=args.quality,
                subsampling=0,
                optimize=True,
                progressive=False,
                icc_profile=None,
                exif=b"",
            )

        pdf.drawImage(
            ImageReader(str(flattened_path)),
            0,
            0,
            width=PAGE_WIDTH_PT,
            height=PAGE_HEIGHT_PT,
            preserveAspectRatio=False,
            mask=None,
        )
        pdf.showPage()

    pdf.save()
    print(
        f"pages={len(page_paths)} pink_pixels={pink_pixels}/{total_pixels} "
        f"({100 * pink_pixels / total_pixels:.6f}%) output={args.output_pdf}"
    )


if __name__ == "__main__":
    main()
