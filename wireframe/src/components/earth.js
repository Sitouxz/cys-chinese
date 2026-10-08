export const EARTH_TILT = (18 * Math.PI) / 180;
export const HOME_LONGITUDE = 105;
// Degrees per millisecond: one slow revolution every 72 seconds.
export const AUTO_ROTATE_SPEED = 0.005;
// Auto-rotation resumes this long after the last drag, zoom or key press.
export const RESUME_AFTER_MS = 3500;
export const clampZoom = (value) => Math.max(0.8, Math.min(1.4, value));
export const clampTilt = (value) =>
  Math.max((-25 * Math.PI) / 180, Math.min((55 * Math.PI) / 180, value));
export function projectEarth(
  lat,
  lon,
  longitude = HOME_LONGITUDE,
  zoom = 1,
  tilt = EARTH_TILT,
) {
  const a = (lat * Math.PI) / 180;
  const b = ((lon - longitude) * Math.PI) / 180;
  const y = Math.sin(a),
    z = Math.cos(a) * Math.cos(b);
  return {
    x: 0.5 + Math.cos(a) * Math.sin(b) * 0.43 * zoom,
    y: 0.5 - (y * Math.cos(tilt) - z * Math.sin(tilt)) * 0.43 * zoom,
    front: z * Math.cos(tilt) + y * Math.sin(tilt) > 0,
  };
}
