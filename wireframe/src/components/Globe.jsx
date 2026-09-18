import { useEffect, useRef, useState } from "react";
import { useApp } from "./runtime.jsx";
// Local equirectangular Earth imagery, projected onto a sphere without a WebGL dependency.
export function Globe() {
  const ref = useRef(null),
    control = useRef({ longitude: 105, zoom: 1, paused: false, dirty: true });
  const { t } = useApp();
  const [paused, setPaused] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    control.current.paused = paused;
    control.current.dirty = true;
  }, [paused]);
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 360;
    canvas.width = size;
    canvas.height = size;
    let frame,
      texture,
      visible = true,
      previous = 0,
      drag = null,
      disposed = false;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setPaused(media.matches);
    media.addEventListener("change", motion);
    const img = new Image();
    img.onload = () => {
      if (disposed) return;
      const map = document.createElement("canvas");
      map.width = img.width;
      map.height = img.height;
      const c = map.getContext("2d", { willReadFrequently: true });
      c.drawImage(img, 0, 0);
      texture = c.getImageData(0, 0, img.width, img.height);
      control.current.dirty = true;
    };
    img.onerror = () => {
      if (!disposed) setFailed(true);
    };
    img.src = "/assets/earth-day.jpg";
    const render = (time) => {
      frame = requestAnimationFrame(render);
      if (!texture || !visible || document.hidden || time - previous < 60)
        return;
      const elapsed = Math.min(100, time - previous);
      previous = time;
      const c = control.current;
      if (!c.paused && !drag) {
        c.longitude += elapsed * 0.0015;
        c.dirty = true;
      }
      if (!c.dirty) return;
      c.dirty = false;
      const image = ctx.createImageData(size, size),
        radius = 158 * c.zoom;
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
          const nx = (x - size / 2) / radius,
            ny = (size / 2 - y) / radius,
            r2 = nx * nx + ny * ny;
          if (r2 > 1) continue;
          const z = Math.sqrt(1 - r2),
            tilt = (18 * Math.PI) / 180;
          const worldY = ny * Math.cos(tilt) + z * Math.sin(tilt),
            worldZ = z * Math.cos(tilt) - ny * Math.sin(tilt);
          const lat = Math.asin(worldY),
            lon = Math.atan2(nx, worldZ) + (c.longitude * Math.PI) / 180;
          const u = (((lon / (2 * Math.PI) + 0.5) % 1) + 1) % 1,
            v = 0.5 - lat / Math.PI;
          const ti =
              (Math.min(texture.height - 1, Math.floor(v * texture.height)) *
                texture.width +
                Math.floor(u * texture.width)) *
              4,
            di = (y * size + x) * 4;
          const light =
            0.35 + 0.65 * Math.max(0, z * 0.85 - nx * 0.35 + ny * 0.2);
          for (let channel = 0; channel < 3; channel++)
            image.data[di + channel] = texture.data[ti + channel] * light;
          image.data[di + 3] = Math.min(255, (1 - r2) * radius * 255);
        }
      ctx.putImageData(image, 0, 0);
      const project = (lat, lon) => {
        const a = (lat * Math.PI) / 180,
          b = ((lon - c.longitude) * Math.PI) / 180,
          tilt = (18 * Math.PI) / 180;
        const yy = Math.sin(a),
          zz = Math.cos(a) * Math.cos(b);
        return {
          x: size / 2 + Math.cos(a) * Math.sin(b) * radius,
          y: size / 2 - (yy * Math.cos(tilt) - zz * Math.sin(tilt)) * radius,
          front: zz * Math.cos(tilt) + yy * Math.sin(tilt) > 0,
        };
      };
      for (const [lat, lon, name] of [
        [31.2, 121.5, t("中国", "CHINA")],
        [1.3, 103.8, t("新加坡", "SINGAPORE")],
      ]) {
        const p = project(lat, lon);
        if (!p.front) continue;
        ctx.fillStyle = "#f2d697";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "11px system-ui";
        ctx.fillText(name, p.x + 8, p.y - 7);
      }
    };
    const down = (e) => {
      drag = { x: e.clientX };
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e) => {
      if (!drag) return;
      control.current.longitude -= (e.clientX - drag.x) * 0.4;
      drag.x = e.clientX;
      control.current.dirty = true;
    };
    const up = () => {
      drag = null;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(canvas);
    frame = requestAnimationFrame(render);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      media.removeEventListener("change", motion);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [t("中国", "CHINA")]);
  const change = (key, amount) => {
    control.current[key] += amount;
    control.current.zoom = Math.max(0.8, Math.min(1.1, control.current.zoom));
    control.current.dirty = true;
  };
  return (
    <div className="earth-interactive">
      <canvas
        className="globe"
        ref={ref}
        role="img"
        aria-label={t(
          "真实地球：中国与新加坡。拖动旋转，或使用下方按钮。",
          "Earth showing China and Singapore. Drag to rotate, or use the controls below.",
        )}
      />
      {failed && (
        <p role="status">
          {t("地球图像暂时无法加载", "Earth image could not load")}
        </p>
      )}
      <div className="globe-controls">
        <button
          aria-label={t("向左旋转", "Rotate left")}
          onClick={() => change("longitude", -15)}
        >
          ←
        </button>
        <button
          aria-label={t("向右旋转", "Rotate right")}
          onClick={() => change("longitude", 15)}
        >
          →
        </button>
        <button
          aria-label={t("放大地球", "Zoom in")}
          onClick={() => change("zoom", 0.1)}
        >
          +
        </button>
        <button
          aria-label={t("缩小地球", "Zoom out")}
          onClick={() => change("zoom", -0.1)}
        >
          −
        </button>
        <button onClick={() => setPaused(!paused)}>
          {paused
            ? t("自动旋转", "Auto-rotate")
            : t("暂停旋转", "Pause rotation")}
        </button>
        <button
          onClick={() => {
            Object.assign(control.current, {
              longitude: 105,
              zoom: 1,
              dirty: true,
            });
          }}
        >
          {t("重置", "Reset")}
        </button>
      </div>
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
