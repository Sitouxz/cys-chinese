export const EARTH_TILT = (18 * Math.PI) / 180;
export const AUTO_ROTATE_MS = 5000;
export const clampZoom = (value) => Math.max(0.8, Math.min(1.1, value));
export function projectEarth(lat, lon, longitude = 105, zoom = 1) {
  const a = (lat * Math.PI) / 180;
  const b = ((lon - longitude) * Math.PI) / 180;
  const y = Math.sin(a),
    z = Math.cos(a) * Math.cos(b);
  return {
    x: 0.5 + Math.cos(a) * Math.sin(b) * 0.43 * zoom,
    y:
      0.5 - (y * Math.cos(EARTH_TILT) - z * Math.sin(EARTH_TILT)) * 0.43 * zoom,
    front: z * Math.cos(EARTH_TILT) + y * Math.sin(EARTH_TILT) > 0,
  };
}
