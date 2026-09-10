import { useEffect, useRef } from "react";
export function Globe() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas.getContext("2d");
    if (!ctx) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame,
      visible = true,
      rotation = -0.3,
      phase = 0,
      pointer = { x: 0, y: 0 },
      width = 600;
    const resize = () => {
      width = canvas.clientWidth || 600;
      const ratio = Math.min(devicePixelRatio, 2);
      canvas.width = width * ratio;
      canvas.height = width * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const project = (lat, lon, radius = 1) => {
      const a = (lat * Math.PI) / 180,
        b = ((lon - 105) * Math.PI) / 180 + rotation + pointer.x;
      const x = Math.cos(a) * Math.sin(b),
        y = -Math.sin(a),
        z = Math.cos(a) * Math.cos(b);
      const tilt = 0.16 + pointer.y;
      return {
        x: width / 2 + x * width * 0.39 * radius,
        y:
          width / 2 +
          (y * Math.cos(tilt) - z * Math.sin(tilt)) * width * 0.39 * radius,
        z,
      };
    };
    const line = (points) => {
      ctx.beginPath();
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    };
    // Geographic outlines are a decorative approximation, never asserted payment routes.
    const lands = [
      [
        [70, 35],
        [55, 30],
        [48, 45],
        [42, 50],
        [30, 48],
        [22, 60],
        [8, 77],
        [25, 90],
        [20, 106],
        [5, 104],
        [-6, 112],
        [-7, 130],
        [5, 122],
        [23, 121],
        [35, 140],
        [48, 145],
        [58, 160],
        [70, 145],
        [70, 35],
      ],
      [
        [-12, 130],
        [-20, 115],
        [-34, 115],
        [-39, 145],
        [-25, 153],
        [-12, 142],
        [-12, 130],
      ],
      [
        [35, -5],
        [30, 30],
        [12, 45],
        [-15, 40],
        [-34, 20],
        [-10, 10],
        [5, -15],
        [35, -5],
      ],
      [
        [70, -160],
        [55, -130],
        [32, -115],
        [15, -87],
        [28, -80],
        [50, -60],
        [70, -100],
        [70, -160],
      ],
      [
        [10, -80],
        [-5, -35],
        [-30, -50],
        [-55, -70],
        [-15, -78],
        [10, -80],
      ],
    ];
    const draw = () => {
      if (visible && !document.hidden) {
        ctx.clearRect(0, 0, width, width);
        if (!media.matches) {
          phase += 0.0007;
          rotation = -0.3 + Math.sin(phase) * 0.26;
        }
        const glow = ctx.createRadialGradient(
          width / 2,
          width / 2,
          width * 0.1,
          width / 2,
          width / 2,
          width * 0.49,
        );
        glow.addColorStop(0, "#1A335830");
        glow.addColorStop(0.8, "#24446F20");
        glow.addColorStop(1, "#12213A00");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, width);
        ctx.lineWidth = 0.65;
        ctx.strokeStyle = "#D9B87730";
        for (let lat = -75; lat <= 75; lat += 15)
          line(Array.from({ length: 121 }, (_, i) => project(lat, i * 3)));
        for (let lon = 0; lon < 360; lon += 15)
          line(Array.from({ length: 61 }, (_, i) => project(i * 3 - 90, lon)));
        ctx.strokeStyle = "#D9B87780";
        ctx.lineWidth = 1;
        lands.forEach((land) => {
          for (let i = 0; i < land.length - 1; i++) {
            const a = land[i],
              b = land[i + 1];
            const points = Array.from({ length: 12 }, (_, n) =>
              project(
                a[0] + ((b[0] - a[0]) * n) / 11,
                a[1] + ((b[1] - a[1]) * n) / 11,
              ),
            );
            if (points.every((p) => p.z > -0.1)) line(points);
          }
        });
        for (let lat = -45; lat <= 65; lat += 5)
          for (let lon = 30; lon < 155; lon += 5) {
            if ((lat * 17 + lon * 13) % 7 > 3) continue;
            const p = project(lat, lon);
            if (p.z > 0) {
              ctx.fillStyle = "#D9B87765";
              ctx.beginPath();
              ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        const sg = project(1.3, 103.8),
          cn = project(31.2, 121.5);
        if (sg.z > 0 && cn.z > 0) {
          ctx.strokeStyle = "#D9B877";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(sg.x, sg.y);
          ctx.quadraticCurveTo(
            cn.x + width * 0.16,
            cn.y + width * 0.12,
            cn.x,
            cn.y,
          );
          ctx.stroke();
          [sg, cn].forEach((p) => {
            ctx.fillStyle = "#D9B87725";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#F1E3C6";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }
      frame = requestAnimationFrame(draw);
    };
    const move = (e) => {
      if (media.matches) return;
      const r = canvas.getBoundingClientRect();
      pointer = {
        x: ((e.clientX - r.left) / r.width - 0.5) * 0.1,
        y: ((e.clientY - r.top) / r.height - 0.5) * 0.06,
      };
    };
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
    });
    observer.observe(canvas);
    const size = new ResizeObserver(resize);
    size.observe(canvas);
    resize();
    draw();
    canvas.parentElement.addEventListener("pointermove", move);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      size.disconnect();
      canvas.parentElement?.removeEventListener("pointermove", move);
    };
  }, []);
  return <canvas className="globe" ref={ref} aria-hidden="true" />;
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
