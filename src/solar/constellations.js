// Constellation lines and name labels, as one draw call each. Ported from Solar System 3D (d3-celestial, BSD-3).
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, LineBasicMaterial, LineSegments, LinearFilter, Mesh,
  ShaderMaterial, Vector3,
} from 'three';
import { equatorialToScene } from './astro.js';

export const SKY_RADIUS = 1000;
const noRaycast = () => {};

export function buildConstellationLines(constellations) {
  const vertices = [];
  const a = new Vector3();
  const b = new Vector3();
  for (const { lines } of constellations) {
    for (const polyline of lines) {
      for (let i = 0; i < polyline.length - 1; i++) {
        equatorialToScene(polyline[i][0], polyline[i][1], a).multiplyScalar(SKY_RADIUS);
        equatorialToScene(polyline[i + 1][0], polyline[i + 1][1], b).multiplyScalar(SKY_RADIUS);
        vertices.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
  const lines = new LineSegments(geometry, new LineBasicMaterial({
    color: 0x7f9fd4, transparent: true, opacity: 0.17, depthTest: true, depthWrite: false,
    blending: AdditiveBlending,
  }));
  lines.frustumCulled = false;
  lines.raycast = noRaycast;
  return lines;
}

/** Constellation names: one atlas texture and one draw call, as screen-aligned quads. */
export function buildConstellationNames(constellations, pixelRatio, resolution) {
  const FONT_PX = 26;
  const ROW = FONT_PX + 10;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const g = canvas.getContext('2d');
  g.font = `400 ${FONT_PX}px -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
  g.textBaseline = 'middle';
  g.fillStyle = '#ffffff';

  const positions = [];
  const corners = [];
  const uvs = [];
  const indices = [];
  const direction = new Vector3();
  let x = 4;
  let y = 4;
  constellations.forEach((c, i) => {
    const text = c.name.toUpperCase().split('').join(' ');
    const width = Math.ceil(g.measureText(text).width) + 4;
    if (x + width > canvas.width) {
      x = 4;
      y += ROW;
    }
    g.fillText(text, x, y + ROW / 2);

    const u0 = x / canvas.width;
    const u1 = (x + width) / canvas.width;
    const v1 = 1 - y / canvas.height;
    const v0 = 1 - (y + ROW) / canvas.height;
    equatorialToScene(c.label[0], c.label[1], direction).multiplyScalar(SKY_RADIUS);
    for (const [cx, cy, u, v] of [[-1, -1, u0, v0], [1, -1, u1, v0], [1, 1, u1, v1], [-1, 1, u0, v1]]) {
      positions.push(direction.x, direction.y, direction.z);
      corners.push(cx * width * 0.5, cy * ROW * 0.5);
      uvs.push(u, v);
    }
    const base = i * 4;
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    x += width + 6;
  });

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('corner', new BufferAttribute(new Float32Array(corners), 2));
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);

  const material = new ShaderMaterial({
    uniforms: { atlas: { value: texture }, pixelRatio: { value: pixelRatio }, resolution: { value: resolution } },
    vertexShader: /* glsl */ `
      attribute vec2 corner;
      uniform float pixelRatio;
      uniform vec2 resolution;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        // The atlas is drawn at twice display size, for crispness on high-DPI screens.
        clip.xy += corner * 0.2 * pixelRatio * 2.0 / resolution * clip.w;
        gl_Position = clip;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D atlas;
      varying vec2 vUv;
      void main() {
        gl_FragColor = vec4(0.62, 0.72, 0.92, texture2D(atlas, vUv).a * 0.55);
      }
    `,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });
  const names = new Mesh(geometry, material);
  names.frustumCulled = false;
  names.raycast = noRaycast;
  return names;
}
