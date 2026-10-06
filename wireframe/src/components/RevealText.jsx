import { useEffect, useRef } from "react";
import { useApp } from "./runtime.jsx";
import { revealSegments } from "./reveal.js";

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
          : Math.max(
              0,
              Math.min(
                1,
                (innerHeight * 0.9 - bounds.top) /
                  Math.max(1, innerHeight * 0.45 + bounds.height * 0.5),
              ),
            );
        element
          .querySelectorAll(".reveal-segment")
          .forEach((part, i, parts) => {
            const reveal = Math.max(
              0,
              Math.min(1, (progress * (parts.length + 8)) / 8 - i / 8),
            );
            part.style.opacity = String(0.75 + reveal * 0.25);
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
        {segments.map((segment, i) => (
          <span className="reveal-segment" key={i}>
            {segment}
          </span>
        ))}
      </span>
    </span>
  );
}
