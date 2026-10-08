const VERTEX = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

// Ray-casts an orthographic sphere per pixel: day map with clouds and ocean
// glint on the lit side, city lights across the terminator, atmosphere rim.
const FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uDay, uNight, uClouds;
uniform vec2 uResolution;
uniform float uLongitude, uTilt, uRadius, uCloudShift;
uniform vec3 uSun;
out vec4 color;
const float PI = 3.141592653589793;
const vec3 AIR = vec3(0.32, 0.62, 1.0);

vec3 linear(vec3 c) { return pow(c, vec3(2.2)); }

// Two candidate longitudes avoid the mip seam where atan wraps (Tarini 2012).
vec4 sampleWrapped(sampler2D map, float u, float v) {
  vec2 a = vec2(fract(u), v), b = vec2(fract(u + 0.5) - 0.5, v);
  vec2 da = vec2(dFdx(a.x), dFdy(a.x)), db = vec2(dFdx(b.x), dFdy(b.x));
  bool useA = dot(da, da) <= dot(db, db);
  vec2 uv = useA ? a : b;
  return textureGrad(map, uv, useA ? dFdx(a) : dFdx(b), useA ? dFdy(a) : dFdy(b));
}

void main() {
  vec2 p = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
  float d = length(p) / uRadius;
  float pixel = 2.0 / (uResolution.x * uRadius);
  vec2 sunScreen = normalize(uSun.xy + 1e-4);

  float halo = 0.0;
  if (d > 1.0 - pixel) {
    float fall = clamp(1.0 - (d - 1.0) / 0.13, 0.0, 1.0);
    float side = 0.3 + 0.7 * smoothstep(-0.6, 0.8, dot(normalize(p), sunScreen));
    halo = pow(fall, 2.6) * side * 0.85;
  }
  // No early return outside the disc: textureGrad needs derivatives from
  // every pixel in a quad, so off-disc pixels shade the clamped limb instead.
  vec2 s = p / uRadius;
  s *= min(1.0, 1.0 / max(length(s), 1e-4));
  float z = sqrt(max(0.0, 1.0 - dot(s, s)));
  vec3 n = vec3(s, z);
  float worldY = s.y * cos(uTilt) + z * sin(uTilt);
  float worldZ = z * cos(uTilt) - s.y * sin(uTilt);
  float u = atan(s.x, worldZ) / (2.0 * PI) + 0.5 + uLongitude / 360.0;
  float v = 0.5 - asin(clamp(worldY, -1.0, 1.0)) / PI;

  vec3 day = linear(sampleWrapped(uDay, u, v).rgb);
  vec3 night = linear(sampleWrapped(uNight, u, v).rgb);
  vec3 surface = sampleWrapped(uClouds, u, v).rgb;
  float cloud = smoothstep(0.18, 0.95, sampleWrapped(uClouds, u + uCloudShift, v).b);

  float light = dot(n, uSun);
  float dayside = smoothstep(-0.12, 0.28, light);
  vec3 lit = mix(day, vec3(0.9, 0.94, 1.0), cloud * 0.82);
  lit *= max(light, 0.0) * 1.35 + 0.035;
  float ocean = 1.0 - surface.g;
  vec3 halfway = normalize(uSun + vec3(0.0, 0.0, 1.0));
  float glint = pow(max(dot(n, halfway), 0.0), 60.0) * ocean * (1.0 - cloud);
  lit += vec3(1.0, 0.86, 0.62) * glint * 0.75;
  vec3 dark = night * vec3(1.4, 1.05, 0.65) * 3.2 * (1.0 - cloud * 0.7);
  dark += day * vec3(0.022, 0.04, 0.075) + vec3(0.002, 0.006, 0.016);
  vec3 rgb = mix(dark, lit, dayside);

  float rim = pow(1.0 - z, 2.4);
  rgb += AIR * rim * (0.12 + 0.75 * smoothstep(-0.35, 0.6, light));
  rgb = pow(rgb, vec3(1.0 / 2.2));

  float coverage = 1.0 - smoothstep(1.0 - pixel, 1.0 + pixel, d);
  color = vec4(rgb * coverage + AIR * halo * (1.0 - coverage), max(coverage, halo));
}`;

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(shader) || "Earth shader failed");
  return shader;
};

export function createEarthRenderer(canvas) {
  const gl = canvas.getContext("webgl2", {
    premultipliedAlpha: true,
    antialias: false,
    // Keeps frames readable by toDataURL for visual regression checks.
    preserveDrawingBuffer: true,
  });
  if (!gl) return null;
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(program) || "Earth program failed");
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniform = (name) => gl.getUniformLocation(program, name);
  const textures = [];
  ["uDay", "uNight", "uClouds"].forEach((name, unit) =>
    gl.uniform1i(uniform(name), unit),
  );
  const anisotropy = gl.getExtension("EXT_texture_filter_anisotropic");
  const sun = [-0.86, 0.3, 0.4],
    length = Math.hypot(...sun);
  gl.uniform3f(uniform("uSun"), ...sun.map((value) => value / length));
  return {
    setTextures(images) {
      images.forEach((image, unit) => {
        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGB,
          gl.RGB,
          gl.UNSIGNED_BYTE,
          image,
        );
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_MIN_FILTER,
          gl.LINEAR_MIPMAP_LINEAR,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if (anisotropy)
          gl.texParameterf(
            gl.TEXTURE_2D,
            anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,
            8,
          );
        textures.push(texture);
      });
    },
    render({ longitude, tilt, zoom, cloudShift }) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniform("uResolution"), canvas.width, canvas.height);
      gl.uniform1f(uniform("uLongitude"), longitude);
      gl.uniform1f(uniform("uTilt"), tilt);
      // Matches projectEarth: radius is 0.43 of the canvas, 0.86 in clip space.
      gl.uniform1f(uniform("uRadius"), 0.86 * zoom);
      gl.uniform1f(uniform("uCloudShift"), cloudShift);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      textures.forEach((texture) => gl.deleteTexture(texture));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      // Frees the context now rather than at GC, so SPA navigation never
      // hits the browser's live-context cap.
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
