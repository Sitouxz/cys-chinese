import { useEffect, useRef } from "react";
import { useApp } from "./runtime.jsx";
import { revealSegments } from "./reveal.js";

// Segments revealing at once; a smaller window gives a sharper word-by-word sweep.
const WINDOW = 6;
const clamp = (value) => Math.max(0, Math.min(1, value));

// Scroll-linked (not time-based) so the reveal plays forward on scroll down and
// rewinds on scroll up. Each word first appears as a solid box, then the box
// dissolves into the word.
export function RevealText({ children }) {
  const { lang } = useApp();
  const ref = useRef(null);
  const segments = revealSegments(children, lang === "zh" ? "zh-CN" : "en");
  useEffect(() => {
    const element = ref.current,
      media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = element.getBoundingClientRect();
        const progress = media.matches
          ? 1
          : clamp(
              (innerHeight * 0.92 - bounds.top) /
                Math.max(1, innerHeight * 0.5 + bounds.height * 0.6),
            );
        const parts = element.querySelectorAll(".reveal-segment");
        parts.forEach((part, i) => {
          const local = clamp(
            (progress * (parts.length + WINDOW)) / WINDOW - i / WINDOW,
          );
          const box =
            local < 0.35 ? local / 0.35 : clamp(1 - (local - 0.35) / 0.45);
          part.style.setProperty("--box", box.toFixed(3));
          part.style.setProperty(
            "--word",
            clamp((local - 0.4) / 0.6).toFixed(3),
          );
        });
      });
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    media.addEventListener("change", update);
    const size = new ResizeObserver(update);
    size.observe(element);
    update();
    return () => {
      cancelAnimationFrame(frame);
      size.disconnect();
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
      media.removeEventListener("change", update);
    };
  }, [children, lang]);
  return (
    <span className="reveal-copy" ref={ref}>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">
        {segments.map((segment, i) =>
          segment.trim() ? (
            <span className="reveal-segment" key={i}>
              <span className="reveal-box" />
              <span className="reveal-word">{segment}</span>
            </span>
          ) : (
            segment
          ),
        )}
      </span>
    </span>
  );
}
