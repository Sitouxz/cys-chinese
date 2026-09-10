"""Render a single-canvas diagram HTML to PNG at 3x and to a same-size PDF.

    python scripts/render_diagram.py docs/moderation-flow-diagram.html docs/CYS-Chinese-Moderation-Flow

Emits <out>.png at 3x device pixels and <out>.pdf at 1x CSS pixels with vector text.
Same approach as CYS-Chinese-Sitemap-Diagram.png: the body has a fixed width and the
page's own wire script sets the height, so a full-page capture is exact — no guessed
paper size, no clipping.
"""

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

SCALE = 3
WIDTH = 1400


def render(src: Path, out_base: Path) -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(
            viewport={"width": WIDTH, "height": 1000}, device_scale_factor=SCALE
        )
        page.goto(src.resolve().as_uri(), wait_until="networkidle")
        page.evaluate("document.fonts.ready")

        # The wire script sizes the canvas; read it back rather than assuming.
        size = page.evaluate(
            "() => ({ width: document.body.scrollWidth,"
            "         height: document.getElementById('wrap').scrollHeight })"
        )

        out_base.parent.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(out_base.with_suffix(".png")), full_page=True)
        page.pdf(
            path=str(out_base.with_suffix(".pdf")),
            width=f"{size['width']}px",
            height=f"{size['height']}px",
            print_background=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
        )
        browser.close()

    w, h = size["width"], size["height"]
    print(f"{out_base.name}.png  {w * SCALE}x{h * SCALE} ({SCALE}x)")
    print(f"{out_base.name}.pdf  {w}x{h}")


if __name__ == "__main__":
    render(Path(sys.argv[1]), Path(sys.argv[2]))
