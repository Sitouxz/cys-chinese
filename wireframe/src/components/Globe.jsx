import { useEffect, useId, useRef, useState } from "react";
import { useApp } from "./runtime.jsx";
import {
  AUTO_ROTATE_SPEED,
  EARTH_TILT,
  HOME_LONGITUDE,
  RESUME_AFTER_MS,
  clampTilt,
  clampZoom,
  projectEarth,
} from "./earth.js";
import { createEarthRenderer } from "./earthGl.js";

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Earth texture failed: " + src));
    image.src = src;
  });

export function Globe() {
  const ref = useRef(null),
    chinaRef = useRef(null),
    singaporeRef = useRef(null),
    pausedRef = useRef(false);
  const helpId = useId();
  const { t } = useApp();
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  pausedRef.current = paused;
  useEffect(() => {
    const canvas = ref.current;
    let renderer;
    try {
      renderer = createEarthRenderer(canvas);
    } catch {
      renderer = null;
    }
    if (!renderer) {
      setFailed(true);
      return;
    }
    const view = {
      longitude: HOME_LONGITUDE,
      tilt: EARTH_TILT,
      zoom: 1,
      cloudShift: 0,
    };
    let frame,
      previous = 0,
      ready = false,
      requested = false,
      visible = false,
      disposed = false,
      dirty = true,
      lastInteraction = -Infinity,
      spin = 0;
    const pointers = new Map();
    let pinchDistance = null;
    const resize = () => {
      const next = Math.min(
        1536,
        Math.max(
          1,
          Math.round(canvas.clientWidth * Math.min(devicePixelRatio || 1, 2)),
        ),
      );
      if (canvas.width === next) return;
      canvas.width = next;
      canvas.height = next;
      dirty = true;
    };
    const labels = () => {
      for (const [element, lat, lon] of [
        [chinaRef.current, 31.2, 121.5],
        [singaporeRef.current, 1.3, 103.8],
      ]) {
        const p = projectEarth(lat, lon, view.longitude, view.zoom, view.tilt);
        element.hidden = !p.front;
        element.style.left = `${p.x * 100}%`;
        element.style.top = `${p.y * 100}%`;
      }
    };
    const interact = () => {
      lastInteraction = performance.now();
      dirty = true;
    };
    const draw = (time) => {
      frame = requestAnimationFrame(draw);
      const elapsed = previous ? Math.min(64, time - previous) : 0;
      previous = time;
      if (!ready || !visible || document.hidden) return;
      const idle = time - lastInteraction > RESUME_AFTER_MS;
      if (!pausedRef.current && idle && !pointers.size) {
        view.longitude += elapsed * AUTO_ROTATE_SPEED;
        view.cloudShift += elapsed * 0.0000012;
        dirty = true;
      }
      if (Math.abs(spin) > 0.0005 && !pointers.size) {
        // Drag release keeps a little momentum before settling.
        view.longitude += spin * elapsed;
        spin *= Math.pow(0.9, elapsed / 16);
        dirty = true;
      }
      if (!dirty) return;
      dirty = false;
      renderer.render(view);
      labels();
    };
    const load = async () => {
      requested = true;
      const tier = canvas.clientWidth > 520 ? 4096 : 2048;
      try {
        const images = await Promise.all(
          [
            `/assets/earth-day-${tier}.jpg`,
            `/assets/earth-night-${tier}.jpg`,
            "/assets/earth-clouds.jpg",
          ].map(loadImage),
        );
        if (disposed) return;
        renderer.setTextures(images);
        ready = true;
        dirty = true;
      } catch {
        if (!disposed) setFailed(true);
      }
    };
    const distance = () => {
      const [a, b] = [...pointers.values()];
      return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : null;
    };
    const down = (event) => {
      interact();
      spin = 0;
      pointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
        time: event.timeStamp,
      });
      canvas.setPointerCapture(event.pointerId);
      pinchDistance = distance();
    };
    const move = (event) => {
      const prior = pointers.get(event.pointerId);
      if (!prior) return;
      interact();
      pointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
        time: event.timeStamp,
      });
      const nextDistance = distance();
      if (nextDistance && pinchDistance) {
        view.zoom = clampZoom((view.zoom * nextDistance) / pinchDistance);
      } else {
        const width = Math.max(1, canvas.clientWidth);
        const delta = -((event.clientX - prior.x) * 180) / width;
        view.longitude += delta;
        view.tilt = clampTilt(
          view.tilt + ((event.clientY - prior.y) * Math.PI) / 2 / width,
        );
        spin = Math.max(
          -0.2,
          Math.min(0.2, delta / Math.max(16, event.timeStamp - prior.time)),
        );
      }
      pinchDistance = nextDistance;
    };
    const up = (event) => {
      if (!pointers.delete(event.pointerId)) return;
      interact();
      pinchDistance = distance();
    };
    const wheel = (event) => {
      // Zoom is deliberate: ordinary wheel scrolling continues through the page.
      if (document.activeElement !== canvas) return;
      event.preventDefault();
      interact();
      view.zoom = clampZoom(view.zoom - Math.sign(event.deltaY) * 0.05);
    };
    const key = (event) => {
      const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
      if (event.key === "Escape") {
        setPaused(true);
        return;
      }
      if (![...keys, "+", "=", "-", "Home"].includes(event.key)) return;
      event.preventDefault();
      interact();
      spin = 0;
      if (event.key === "ArrowLeft") view.longitude -= 15;
      if (event.key === "ArrowRight") view.longitude += 15;
      if (event.key === "ArrowUp") view.tilt = clampTilt(view.tilt + 0.15);
      if (event.key === "ArrowDown") view.tilt = clampTilt(view.tilt - 0.15);
      if (["+", "=", "-"].includes(event.key))
        view.zoom = clampZoom(view.zoom + (event.key === "-" ? -0.05 : 0.05));
      if (event.key === "Home") {
        view.longitude = HOME_LONGITUDE;
        view.tilt = EARTH_TILT;
        view.zoom = 1;
      }
    };
    const events = {
      pointerdown: down,
      pointermove: move,
      pointerup: up,
      pointercancel: up,
      lostpointercapture: up,
      keydown: key,
    };
    for (const [name, handler] of Object.entries(events))
      canvas.addEventListener(name, handler);
    canvas.addEventListener("wheel", wheel, { passive: false });
    // Textures load on first view, so the hidden timeline globe costs nothing.
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !requested) load();
      dirty = true;
    });
    observer.observe(canvas);
    const sizing = new ResizeObserver(resize);
    sizing.observe(canvas);
    resize();
    labels();
    frame = requestAnimationFrame(draw);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      sizing.disconnect();
      canvas.removeEventListener("wheel", wheel);
      for (const [name, handler] of Object.entries(events))
        canvas.removeEventListener(name, handler);
      renderer.dispose();
    };
  }, []);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => media.matches && setPaused(true);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  return (
    <div className="earth-interactive">
      <canvas
        className="globe"
        ref={ref}
        tabIndex={0}
        role="img"
        aria-label={t("地球：中国与新加坡", "Earth: China and Singapore")}
        aria-describedby={helpId}
      />
      <div className="earth-label" ref={chinaRef} aria-hidden="true">
        {t("中国", "CHINA")}
      </div>
      <div className="earth-label" ref={singaporeRef} aria-hidden="true">
        {t("新加坡", "SINGAPORE")}
      </div>
      <button
        type="button"
        className="earth-pause"
        aria-pressed={paused}
        aria-label={
          paused
            ? t("继续地球旋转", "Resume Earth rotation")
            : t("暂停地球旋转", "Pause Earth rotation")
        }
        onClick={() => setPaused((value) => !value)}
      >
        <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
      </button>
      <span className="sr-only" id={helpId}>
        {t(
          "地球缓慢自动旋转，可用按钮或 Escape 键暂停。拖动旋转与倾斜，双指缩放。聚焦后可使用方向键旋转，加减键或滚轮缩放，Home 键重置。",
          "The Earth rotates slowly; pause it with the button or Escape. Drag to rotate and tilt, pinch to zoom. When focused, use the arrow keys to rotate, plus/minus or the mouse wheel to zoom, and Home to reset.",
        )}
      </span>
      {failed && (
        <p role="status">
          {t("地球图像暂时无法加载", "Earth image could not load")}
        </p>
      )}
    </div>
  );
}

export function Counter({ value, suffix = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    let frame;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const start = performance.now();
      const tick = (time) => {
        const ratio = Math.min(1, (time - start) / 1000);
        element.textContent =
          Math.round(value * (1 - (1 - ratio) ** 3)) + suffix;
        if (ratio < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, suffix]);
  return (
    <strong ref={ref} className="counter" aria-label={`${value}${suffix}`}>
      {value}
      {suffix}
    </strong>
  );
}
