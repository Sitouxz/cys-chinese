import { useEffect, useId, useRef, useState } from "react";
import { useApp } from "./runtime.jsx";
import {
  AUTO_ROTATE_MS,
  EARTH_TILT,
  clampZoom,
  projectEarth,
} from "./earth.js";

export function Globe() {
  const ref = useRef(null),
    chinaRef = useRef(null),
    singaporeRef = useRef(null);
  const helpId = useId();
  const { t } = useApp();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas.getContext("2d");
    if (!ctx) {
      setFailed(true);
      return;
    }
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let size = 0,
      texture,
      geometry,
      output,
      frame,
      previous = 0;
    let visible = false,
      disposed = false,
      dirty = true,
      activeMs = 0;
    let longitude = 105,
      zoom = 1,
      interactive = false;
    const pointers = new Map();
    let pinchDistance = null;
    const buildGeometry = () => {
      if (!size) return;
      output = ctx.createImageData(size, size);
      const pixels = [],
        radius = size * 0.43 * zoom;
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
          const nx = (x - size / 2) / radius,
            ny = (size / 2 - y) / radius;
          const r2 = nx * nx + ny * ny;
          if (r2 > 1) continue;
          const z = Math.sqrt(1 - r2);
          const worldY = ny * Math.cos(EARTH_TILT) + z * Math.sin(EARTH_TILT);
          const worldZ = z * Math.cos(EARTH_TILT) - ny * Math.sin(EARTH_TILT);
          pixels.push(
            (y * size + x) * 4,
            Math.atan2(nx, worldZ) / (2 * Math.PI) + 0.5,
            0.5 - Math.asin(Math.max(-1, Math.min(1, worldY))) / Math.PI,
            0.35 + 0.65 * Math.max(0, z * 0.85 - nx * 0.35 + ny * 0.2),
          );
          output.data[(y * size + x) * 4 + 3] = Math.min(
            255,
            (1 - r2) * radius * 255,
          );
        }
      geometry = new Float32Array(pixels);
      dirty = true;
    };
    const resize = () => {
      const next = Math.min(
        1024,
        Math.max(
          1,
          Math.round(canvas.clientWidth * Math.min(devicePixelRatio || 1, 2)),
        ),
      );
      if (size === next) return;
      size = next;
      canvas.width = size;
      canvas.height = size;
      buildGeometry();
    };
    const labels = () => {
      for (const [element, lat, lon] of [
        [chinaRef.current, 31.2, 121.5],
        [singaporeRef.current, 1.3, 103.8],
      ]) {
        const p = projectEarth(lat, lon, longitude, zoom);
        element.hidden = !p.front;
        element.style.left = `${p.x * 100}%`;
        element.style.top = `${p.y * 100}%`;
      }
    };
    const draw = (time) => {
      frame = requestAnimationFrame(draw);
      if (!texture || !visible || document.hidden) {
        previous = time;
        return;
      }
      if (time - previous < 32) return;
      const elapsed = previous ? Math.min(100, time - previous) : 0;
      previous = time;
      if (!media.matches && !interactive && activeMs < AUTO_ROTATE_MS) {
        const step = Math.min(elapsed, AUTO_ROTATE_MS - activeMs);
        activeMs += step;
        longitude += step * 0.004;
        dirty = true;
      }
      if (!dirty) return;
      dirty = false;
      const offset = longitude / 360,
        data = output.data;
      for (let i = 0; i < geometry.length; i += 4) {
        const di = geometry[i],
          u = (((geometry[i + 1] + offset) % 1) + 1) % 1;
        const ti =
          (Math.min(
            texture.height - 1,
            Math.floor(geometry[i + 2] * texture.height),
          ) *
            texture.width +
            Math.floor(u * texture.width)) *
          4;
        for (let channel = 0; channel < 3; channel++)
          data[di + channel] = texture.data[ti + channel] * geometry[i + 3];
      }
      ctx.putImageData(output, 0, 0);
      labels();
    };
    const img = new Image();
    img.onload = () => {
      if (disposed) return;
      const map = document.createElement("canvas");
      map.width = img.width;
      map.height = img.height;
      const context = map.getContext("2d", { willReadFrequently: true });
      if (!context) {
        setFailed(true);
        return;
      }
      context.drawImage(img, 0, 0);
      texture = context.getImageData(0, 0, img.width, img.height);
      dirty = true;
    };
    img.onerror = () => {
      if (!disposed) setFailed(true);
    };
    img.src = "/assets/earth-day.jpg";
    const distance = () => {
      const [a, b] = [...pointers.values()];
      return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : null;
    };
    const down = (event) => {
      interactive = true;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      canvas.setPointerCapture(event.pointerId);
      pinchDistance = distance();
    };
    const move = (event) => {
      const prior = pointers.get(event.pointerId);
      if (!prior) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const nextDistance = distance();
      if (nextDistance && pinchDistance) {
        zoom = clampZoom((zoom * nextDistance) / pinchDistance);
        buildGeometry();
      } else
        longitude -=
          ((event.clientX - prior.x) * 180) / Math.max(1, canvas.clientWidth);
      pinchDistance = nextDistance;
      dirty = true;
    };
    const up = (event) => {
      pointers.delete(event.pointerId);
      pinchDistance = distance();
    };
    const wheel = (event) => {
      // Zoom is deliberate: ordinary wheel scrolling continues through the page.
      if (document.activeElement !== canvas) return;
      event.preventDefault();
      interactive = true;
      zoom = clampZoom(zoom - Math.sign(event.deltaY) * 0.05);
      buildGeometry();
    };
    const key = (event) => {
      if (
        !["ArrowLeft", "ArrowRight", "+", "=", "-", "Home", "Escape"].includes(
          event.key,
        )
      )
        return;
      event.preventDefault();
      interactive = true;
      if (event.key === "ArrowLeft") longitude -= 15;
      if (event.key === "ArrowRight") longitude += 15;
      if (["+", "=", "-"].includes(event.key))
        zoom = clampZoom(zoom + (event.key === "-" ? -0.05 : 0.05));
      if (event.key === "Home") {
        longitude = 105;
        zoom = 1;
      }
      buildGeometry();
    };
    const motion = () => {
      if (media.matches) activeMs = AUTO_ROTATE_MS;
      dirty = true;
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
    media.addEventListener("change", motion);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
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
      media.removeEventListener("change", motion);
      canvas.removeEventListener("wheel", wheel);
      for (const [name, handler] of Object.entries(events))
        canvas.removeEventListener(name, handler);
    };
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
      <span className="sr-only" id={helpId}>
        {t(
          "自动旋转五秒后停止。拖动旋转，双指缩放。聚焦后可使用左右方向键旋转，加减键缩放，Home 键重置，Escape 键停止。",
          "Rotation stops after five seconds. Drag to rotate, pinch to zoom. When focused, use left/right arrows to rotate, plus/minus or the mouse wheel to zoom, Home to reset and Escape to stop.",
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
