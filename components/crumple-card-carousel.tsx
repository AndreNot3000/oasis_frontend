'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Ticket,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface CrumpleCardItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImageUrl: string;
  accessModel?: string;
  sessionDurationMin?: number;
  isFeatured?: boolean;
  category?: {
    name: string;
    slug?: string;
  };
  pricingRules?: Array<{
    name: string;
    amountMinor: number;
    currency: string;
  }>;
}

export interface CrumpleCardCarouselProps {
  items: CrumpleCardItem[];
  /** Colour behind the carousel. Defaults to #000000 */
  background?: string;
  /** Moves the row of cards up or down on the stage. Defaults to 0 */
  imageY?: number;
  /** How long (ms / distance weight) each card stays flat in the centre before the next card comes in. Defaults to 500 */
  hold?: number;
  /** Controls the depth of the creases and how lumpy the paper ball becomes. Defaults to 100 */
  crumple?: number;
  /** Sets the width of each card in px. Defaults to 507 */
  itemWidth?: number;
  /** Sets the height of each card in px. Defaults to 400 */
  itemHeight?: number;
  /** Controls the spacing between neighbouring cards in px. Defaults to -150 */
  gap?: number;
  /** Rounds the card corners in UV space so rounding folds with the paper. Defaults to 10 */
  radius?: number;
  /** Determines how far the cards move in response to each pixel of dragging. Defaults to 100 */
  dragSens?: number;
  /** Direction in which the carousel moves automatically. Defaults to 'horizontal' */
  direction?: 'horizontal' | 'vertical';
  /** Controls the overshoot effect when a card springs into position. Defaults to 0 */
  bounce?: number;
  /** Controls how strongly the cards respond to pointer movement (0 disables). Defaults to 50 */
  hover?: number;
  /** Controls how quickly the carousel moves to the next card and crumples (0 stops auto-advance). Defaults to 15 */
  speed?: number;
}

/**
 * Draws a rich procedural + photo card face onto a high-DPI 2D canvas.
 * Includes the 6 procedural styles (shards, poster type, portrait, prices, line mascot, neon grid)
 * blended with the live Oasis attraction image, category badge, and pricing.
 */
function renderCardTextureCanvas(
  item: CrumpleCardItem,
  index: number,
  loadedImg?: HTMLImageElement | null,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1014;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const w = canvas.width;
  const h = canvas.height;

  // Palette per card index
  const palettes = [
    { bg1: '#0f172a', bg2: '#1e1b4b', accent: '#00f0ff', secondary: '#ff2a85' },
    { bg1: '#09152b', bg2: '#172554', accent: '#38bdf8', secondary: '#a855f7' },
    { bg1: '#1a1033', bg2: '#311042', accent: '#f43f5e', secondary: '#fbbf24' },
    { bg1: '#06202b', bg2: '#0f172a', accent: '#10b981', secondary: '#00f0ff' },
    { bg1: '#1e1136', bg2: '#090d16', accent: '#eab308', secondary: '#ec4899' },
    { bg1: '#0c192c', bg2: '#1e293b', accent: '#06b6d4', secondary: '#f97316' },
  ];
  const pal = palettes[index % palettes.length];

  // 1. Base gradient background
  const baseGrad = ctx.createLinearGradient(0, 0, w, h);
  baseGrad.addColorStop(0, pal.bg1);
  baseGrad.addColorStop(1, pal.bg2);
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Six procedural art motifs (shards, poster type, portrait, prices, line mascot, geometric)
  const styleVariant = index % 6;
  ctx.save();
  ctx.globalAlpha = loadedImg ? 0.22 : 0.85;
  if (styleVariant === 0) {
    // Shards motif
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = i % 2 === 0 ? pal.accent : pal.secondary;
      ctx.beginPath();
      const cx = (i * 137) % w;
      const cy = (i * 97) % (h * 0.65);
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 120, cy + 40);
      ctx.lineTo(cx + 50, cy + 150);
      ctx.closePath();
      ctx.fill();
    }
  } else if (styleVariant === 1) {
    // Poster kinetic typography motif
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 3;
    ctx.font = '900 110px sans-serif';
    for (let row = 0; row < 4; row++) {
      ctx.strokeText(item.name.toUpperCase(), -40, 120 + row * 125);
    }
  } else if (styleVariant === 2) {
    // Concentric Portrait Halo Rings
    for (let r = 280; r > 40; r -= 45) {
      ctx.strokeStyle = r % 90 === 0 ? pal.accent : pal.secondary;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.36, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (styleVariant === 3) {
    // Bold Price / Ticket Grid Motif
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 2;
    for (let gx = 0; gx < w; gx += 64) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = 0; gy < h; gy += 64) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }
  } else if (styleVariant === 4) {
    // Line Mascot / Continuous Neon Wave Curves
    ctx.strokeStyle = pal.secondary;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let x = 0; x <= w; x += 20) {
      const y = h * 0.32 + Math.sin(x * 0.015 + index) * 95;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  } else {
    // Radial Starburst Motif
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 4;
    for (let a = 0; a < 24; a++) {
      const ang = (a / 24) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(w / 2, h * 0.35);
      ctx.lineTo(
        w / 2 + Math.cos(ang) * 520,
        h * 0.35 + Math.sin(ang) * 520,
      );
      ctx.stroke();
    }
  }
  ctx.restore();

  // 3. Draw Cover Image if loaded (with cover-fit in the upper 68% of the card, blending into the lower info deck)
  if (loadedImg && loadedImg.width > 0 && loadedImg.height > 0) {
    ctx.save();
    const imgAspect = loadedImg.width / loadedImg.height;
    const boxW = w;
    const boxH = h * 0.72;
    const boxAspect = boxW / boxH;
    let drawW = boxW;
    let drawH = boxH;
    let offsetX = 0;
    let offsetY = 0;
    if (imgAspect > boxAspect) {
      drawH = boxH;
      drawW = boxH * imgAspect;
      offsetX = (boxW - drawW) * 0.5;
    } else {
      drawW = boxW;
      drawH = boxW / imgAspect;
      offsetY = (boxH - drawH) * 0.5;
    }
    ctx.drawImage(loadedImg, offsetX, offsetY, drawW, drawH);
    ctx.restore();
  }

  // 4. Deep Cinematic Gradient Vignette over the bottom half for crisp typography
  const vignette = ctx.createLinearGradient(0, h * 0.22, 0, h);
  vignette.addColorStop(0, 'rgba(8, 12, 28, 0.0)');
  vignette.addColorStop(0.52, 'rgba(8, 12, 28, 0.78)');
  vignette.addColorStop(0.75, 'rgba(8, 12, 28, 0.96)');
  vignette.addColorStop(1, '#060919');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // 5. Top-Left Category Pill Badge (Borderless soft pill)
  const catLabel = (item.category?.name || `Zone #${index + 1}`).toUpperCase();
  ctx.font = '800 22px system-ui, -apple-system, sans-serif';
  const catTextWidth = ctx.measureText(catLabel).width;
  const pillW = catTextWidth + 48;
  const pillH = 48;
  ctx.fillStyle = 'rgba(6, 10, 26, 0.85)';
  ctx.beginPath();
  ctx.roundRect(38, 36, pillW, pillH, 24);
  ctx.fill();

  ctx.fillStyle = pal.accent;
  ctx.fillText(catLabel, 62, 68);

  // 7. Top-Right Featured / Index Badge
  const numBadge = `0${index + 1} / 08`;
  ctx.font = '900 22px monospace';
  const numW = ctx.measureText(numBadge).width + 40;
  ctx.fillStyle = item.isFeatured ? '#facc15' : 'rgba(15, 23, 42, 0.85)';
  ctx.beginPath();
  ctx.roundRect(w - numW - 38, 36, numW, 48, 24);
  ctx.fill();
  ctx.fillStyle = item.isFeatured ? '#090d16' : '#e2e8f0';
  ctx.fillText(numBadge, w - numW - 18, 68);

  // 8. Attraction Title (Large Bold Poster Header)
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 46px system-ui, -apple-system, sans-serif';
  ctx.fillText(item.name, 42, h - 195);

  // 9. Short Description (2 lines max)
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '500 24px system-ui, -apple-system, sans-serif';
  const words = (item.description || '').split(' ');
  let line1 = '';
  let line2 = '';
  for (const word of words) {
    const test1 = line1 ? `${line1} ${word}` : word;
    if (ctx.measureText(test1).width < w - 90 && !line2) {
      line1 = test1;
    } else {
      const test2 = line2 ? `${line2} ${word}` : word;
      if (ctx.measureText(test2).width < w - 130) {
        line2 = test2;
      } else {
        line2 += '…';
        break;
      }
    }
  }
  ctx.fillText(line1, 42, h - 145);
  if (line2) ctx.fillText(line2, 42, h - 112);

  // 10. Bottom Divider & Pricing / Session Footer Bar
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(42, h - 82);
  ctx.lineTo(w - 42, h - 82);
  ctx.stroke();

  const sessionText =
    item.accessModel === 'PAY_PER_PLAY'
      ? 'Pay-Per-Play Credits'
      : `${item.sessionDurationMin || 15} Min Session`;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 23px system-ui, -apple-system, sans-serif';
  ctx.fillText(sessionText, 42, h - 36);

  const lowestRule = item.pricingRules?.[0];
  const priceText = lowestRule
    ? `From ${formatCurrency(lowestRule.amountMinor, lowestRule.currency)}`
    : 'View Rates →';
  ctx.fillStyle = '#facc15';
  ctx.font = '900 28px system-ui, -apple-system, sans-serif';
  const priceW = ctx.measureText(priceText).width;
  ctx.fillText(priceText, w - priceW - 42, h - 34);

  return canvas;
}

export function CrumpleCardCarousel({
  items,
  background = 'transparent',
  imageY = 0,
  hold = 3600,
  crumple = 100,
  itemWidth = 507,
  itemHeight = 400,
  gap = -90,
  radius = 14,
  dragSens = 100,
  direction = 'horizontal',
  bounce = 0,
  hover = 50,
  speed = 6,
}: CrumpleCardCarouselProps) {
  const router = useRouter();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<'details' | 'book' | null>(null);
  const isPausedRef = useRef(false);

  // Live interactive state mapped directly to the API Reference props
  const [cfg, setCfg] = useState({
    background,
    imageY,
    hold,
    crumple,
    itemWidth,
    itemHeight,
    gap,
    radius,
    dragSens,
    direction,
    bounce,
    hover,
    speed,
  });

  const cfgRef = useRef(cfg);
  useEffect(() => {
    cfgRef.current = cfg;
  }, [cfg]);

  // Ref for imperative step navigation (Prev / Next buttons or dot clicks)
  const navStepRef = useRef<(delta: number) => void>(() => {});

  useEffect(() => {
    const container = stageRef.current;
    if (!container || items.length === 0) return;

    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 540;

    const scene = new THREE.Scene();

    // Perspective camera where 1 world unit ≈ 100px at z = 0
    const fov = 42;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 100);
    const updateCameraZ = (w: number, h: number) => {
      camera.aspect = w / h;
      const halfFovRad = THREE.MathUtils.degToRad(fov * 0.5);
      // Scale camera distance so 100px = 1 world unit on desktop, and scales down gracefully on mobile
      const responsiveScale = w < 640 ? 1.55 : w < 1024 ? 1.2 : 1.0;
      camera.position.z =
        (h / 100 / (2 * Math.tan(halfFovRad))) * responsiveScale;
      camera.updateProjectionMatrix();
    };
    updateCameraZ(width, height);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(r: T): T => {
      disposables.push(r);
      return r;
    };

    // Clean 36x36 subdivided plane so paper fold facets & dFdx/dFdy crease normals look crisp, not noisy
    const basePlaneGeo = track(new THREE.PlaneGeometry(1, 1, 36, 36));

    // Vertex & Fragment Shaders implementing all 6 Key Features of the Crumple Card Carousel:
    // 1. Vertex shader morphs each card from a flat sheet to a ridged-noise paper ball
    // 2. Edges crumple ahead of the centre, so the sheet folds in from its border
    // 3. Rounded corners are cut in the sheet's UV space, so they fold along with the paper
    // 4. Normals from screen-space derivatives (dFdx/dFdy) give creases real shading and a soft highlight
    // 5. The back of each sheet (!gl_FrontFacing) shows plain paper, and balls tumble on a random axis
    const vertexShader = `
      uniform float uProgress;      // 0.0 = flat sheet, 1.0 = crumpled paper ball
      uniform float uCrumpleDepth;  // mapped from crumple prop (default 100 -> 1.0)
      uniform vec2 uCardSize;       // world-space (itemWidth/100, itemHeight/100)
      uniform vec3 uTumbleAxis;     // per-card random tumble axis
      uniform float uTumbleAngle;   // rotation angle as ball travels
      uniform vec2 uHoverTilt;      // pointer hover response
      uniform float uSignDir;       // -1 left/up, +1 right/down

      varying vec2 vUv;
      varying vec3 vViewPos;
      varying float vCreaseVal;
      varying float vLocalCrumple;

      // 3D Simplex Noise for multi-octave ridged paper creases
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 1.0/7.0;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      // Ridged multifractal noise (2 clean octaves for crisp paper fold planes)
      float ridgedPaperNoise(vec3 p) {
        float n1 = 1.0 - abs(snoise(p * 1.15));
        float n2 = 1.0 - abs(snoise(p * 2.25 + vec3(4.2, 1.7, 8.1)));
        return (n1 * 0.68 + n2 * 0.32);
      }

      // Rodrigues rotation around arbitrary 3D axis
      vec3 rotateAxis(vec3 p, vec3 axis, float angle) {
        vec3 a = normalize(axis);
        float s = sin(angle);
        float c = cos(angle);
        return p * c + cross(a, p) * s + a * dot(a, p) * (1.0 - c);
      }

      void main() {
        vUv = uv;

        // 1. Flat sheet coordinates in world units
        vec3 flatPos = vec3((uv.x - 0.5) * uCardSize.x, (uv.y - 0.5) * uCardSize.y, 0.0);

        // 2. Edges crumple ahead of the centre:
        vec2 centeredUv = (uv - 0.5) * 2.0;
        float boxDist = max(abs(centeredUv.x), abs(centeredUv.y));
        float radialDist = length(centeredUv) / 1.4142;
        float edgeLead = mix(boxDist, radialDist, 0.45);

        // Border vertices start folding before center vertices!
        float localT = smoothstep(0.0, 0.82, uProgress * 1.3 - (1.0 - edgeLead) * 0.3);
        vLocalCrumple = localT;

        // 3. Closed, seamless spherical paper ball mapping (no gaping hole or seam)
        float lon = centeredUv.x * 3.14159265;
        float lat = centeredUv.y * 1.48;
        vec3 sphereDir = vec3(
          sin(lon) * cos(lat),
          sin(lat),
          cos(lon) * cos(lat)
        );

        float baseBallRadius = min(uCardSize.x, uCardSize.y) * 0.31;
        // Evaluate ridged noise purely in continuous 3D sphereDir space so creases wrap seamlessly
        float ridge = ridgedPaperNoise(sphereDir * 1.55);
        vCreaseVal = ridge;

        // Clean, tactile paper ball lumpiness without jagged spikes
        float lumpiness = (ridge - 0.5) * 0.28 * uCrumpleDepth;
        float ballRadius = baseBallRadius * (1.0 + lumpiness);
        vec3 ballPos = sphereDir * ballRadius;

        // Smooth inward border curl as the sheet folds in from its edges
        float foldArc = sin(localT * 3.14159265);
        vec3 sheetCreaseOffset = vec3(
          -centeredUv.x * foldArc * 0.24 * edgeLead,
          -centeredUv.y * foldArc * 0.24 * edgeLead,
          (ridge - 0.5) * foldArc * 0.34 * uCrumpleDepth + edgeLead * foldArc * 0.28
        );

        vec3 morphedPos = mix(flatPos + sheetCreaseOffset, ballPos, smoothstep(0.1, 1.0, localT));

        // 4. Gentle tumble on its random 3D axis as it leaves/arrives
        float tumble = pow(uProgress, 1.2) * uTumbleAngle * 0.55 * uSignDir;
        morphedPos = rotateAxis(morphedPos, uTumbleAxis, tumble);

        // 5. Interactive pointer hover tilt (strongest when flat in the centre)
        float flatWeight = 1.0 - smoothstep(0.0, 0.75, uProgress);
        morphedPos.z += (centeredUv.x * uHoverTilt.x + centeredUv.y * uHoverTilt.y) * 0.35 * flatWeight;

        vec4 mvPosition = modelViewMatrix * vec4(morphedPos, 1.0);
        vViewPos = mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform sampler2D uMap;
      uniform vec2 uCardSizePx;
      uniform float uRadiusPx;
      uniform float uProgress;
      uniform float uCrumpleDepth;

      varying vec2 vUv;
      varying vec3 vViewPos;
      varying float vCreaseVal;
      varying float vLocalCrumple;

      // Signed distance to a 2D rounded box in UV/pixel space
      float sdRoundBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b + vec2(r);
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
      }

      void main() {
        // 1. Cut rounded corners in the sheet's UV space so they fold along with the paper
        vec2 halfSize = uCardSizePx * 0.5;
        vec2 pixelCoord = (vUv - 0.5) * uCardSizePx;
        float clampedR = min(uRadiusPx, min(halfSize.x, halfSize.y) - 1.0);
        float dist = sdRoundBox(pixelCoord, halfSize, max(clampedR, 0.0));
        if (dist > 0.0) discard;

        // 2. Compute geometric facet/crease normal from screen-space derivatives
        vec3 fdx = dFdx(vViewPos);
        vec3 fdy = dFdy(vViewPos);
        vec3 faceNormal = normalize(cross(fdx, fdy));
        if (!gl_FrontFacing) {
          faceNormal = -faceNormal;
        }

        // Studio lighting setup for crisp paper creases & soft highlight
        vec3 lightDir = normalize(vec3(-0.38, 0.58, 0.85));
        vec3 fillLight = normalize(vec3(0.55, -0.35, 0.65));
        vec3 viewDir = normalize(-vViewPos);
        vec3 halfVec = normalize(lightDir + viewDir);

        float diff = max(dot(faceNormal, lightDir), 0.0);
        float fill = max(dot(faceNormal, fillLight), 0.0) * 0.32;
        float spec = pow(max(dot(faceNormal, halfVec), 0.0), 28.0) * (0.18 + 0.25 * vLocalCrumple);

        // Crease valley ambient occlusion & ridge highlight
        float creaseShade = mix(
          1.0,
          0.52 + 0.58 * smoothstep(0.15, 0.88, vCreaseVal),
          vLocalCrumple * clamp(uCrumpleDepth, 0.0, 1.5)
        );
        float lighting = mix(
          0.96 + 0.08 * diff,
          (0.38 + 0.68 * diff + fill) * creaseShade,
          smoothstep(0.02, 0.45, vLocalCrumple)
        );

        if (gl_FrontFacing) {
          // Front of sheet: Attraction card image + paper crease lighting + soft highlight
          vec4 texColor = texture2D(uMap, vUv);
          vec3 litFront = texColor.rgb * lighting + vec3(1.0, 0.98, 0.95) * spec;
          gl_FragColor = vec4(litFront, 1.0);
        } else {
          // Back of sheet: Plain textured warm cream paper stock!
          float paperGrain = fract(sin(dot( floor(vUv * 420.0), vec2(12.9898, 78.233) )) * 43758.5453);
          vec3 plainPaper = vec3(0.95, 0.93, 0.89) - paperGrain * 0.035;
          vec3 paperShadowTint = mix(vec3(0.72, 0.70, 0.66), plainPaper, clamp(lighting, 0.25, 1.05));
          vec3 litBack = paperShadowTint + vec3(1.0) * (spec * 0.65);
          gl_FragColor = vec4(litBack, 1.0);
        }
      }
    `;

    // Create meshes for each attraction card
    interface CardEntry {
      mesh: THREE.Mesh;
      mat: THREE.ShaderMaterial;
      tex: THREE.CanvasTexture;
      item: CrumpleCardItem;
      index: number;
    }

    const cardEntries: CardEntry[] = [];

    items.forEach((item, idx) => {
      // Initial procedural canvas texture
      const initialCanvas = renderCardTextureCanvas(item, idx, null);
      const tex = track(new THREE.CanvasTexture(initialCanvas));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;

      // Deterministically seeded random 3D tumble axis per card
      const ax = Math.sin(idx * 17.3 + 1.2);
      const ay = Math.cos(idx * 23.7 + 0.7);
      const az = Math.sin(idx * 31.1 + 2.4) * 0.6;
      const tumbleAxis = new THREE.Vector3(ax, ay, az).normalize();

      const mat = track(
        new THREE.ShaderMaterial({
          uniforms: {
            uMap: { value: tex },
            uProgress: { value: 0 },
            uCrumpleDepth: { value: cfgRef.current.crumple / 100 },
            uCardSize: {
              value: new THREE.Vector2(
                cfgRef.current.itemWidth / 100,
                cfgRef.current.itemHeight / 100,
              ),
            },
            uCardSizePx: {
              value: new THREE.Vector2(
                cfgRef.current.itemWidth,
                cfgRef.current.itemHeight,
              ),
            },
            uRadiusPx: { value: cfgRef.current.radius },
            uTumbleAxis: { value: tumbleAxis },
            uTumbleAngle: { value: 3.4 + (idx % 3) * 0.65 },
            uHoverTilt: { value: new THREE.Vector2(0, 0) },
            uSignDir: { value: 1.0 },
          },
          vertexShader,
          fragmentShader,
          side: THREE.DoubleSide,
          transparent: false,
          extensions: {
            derivatives: true,
          } as any,
        }),
      );

      const mesh = new THREE.Mesh(basePlaneGeo, mat);
      scene.add(mesh);
      cardEntries.push({ mesh, mat, tex, item, index: idx });

      // Load the real attraction image asynchronously and re-bake onto the card canvas
      if (item.coverImageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const updatedCanvas = renderCardTextureCanvas(item, idx, img);
          tex.image = updatedCanvas;
          tex.needsUpdate = true;
        };
        img.src = item.coverImageUrl;
      }
    });

    // Carousel physics & interaction state
    const numItems = items.length;
    let currentTrackPos = 0; // continuous index in [0, numItems)
    let targetTrackPos = 0;
    let velocity = 0;
    let isDragging = false;
    let dragStartCoord = 0;
    let dragStartTrackPos = 0;
    let lastReportedIndex = 0;
    let holdElapsedMs = 0;
    let lastFrameTime = performance.now();

    const pointerNorm = new THREE.Vector2(0, 0);
    const smoothPointer = new THREE.Vector2(0, 0);

    // Step helper for Prev/Next buttons
    navStepRef.current = (delta: number) => {
      targetTrackPos = Math.round(targetTrackPos + delta);
      holdElapsedMs = 0;
    };

    // Pointer + Touch Drag & Hover handlers (with pan-y touchAction so horizontal swipes work on mobile!)
    let touchSwipeStartX = 0;
    let touchSwipeStartY = 0;
    let touchSwipeDeltaX = 0;
    let isTouchSwiping = false;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return; // handled by dedicated touch listeners below
      isDragging = true;
      dragStartCoord =
        cfgRef.current.direction === 'horizontal' ? e.clientX : e.clientY;
      dragStartTrackPos = targetTrackPos;
      holdElapsedMs = 0;
      (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const rect = container.getBoundingClientRect();
      pointerNorm.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNorm.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (!isDragging) return;
      const currentCoord =
        cfgRef.current.direction === 'horizontal' ? e.clientX : e.clientY;
      const deltaPx = currentCoord - dragStartCoord;
      const sens = Math.max(cfgRef.current.dragSens, 10) / 100;
      const cardSpanPx = Math.max(
        (cfgRef.current.direction === 'horizontal'
          ? cfgRef.current.itemWidth
          : cfgRef.current.itemHeight) + cfgRef.current.gap,
        220,
      );
      targetTrackPos = dragStartTrackPos - (deltaPx * sens) / cardSpanPx;
      holdElapsedMs = 0;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !isDragging) return;
      isDragging = false;
      targetTrackPos = Math.round(targetTrackPos);
      holdElapsedMs = 0;
    };

    // Dedicated Touch Swipe Handlers for iOS Safari & Android Chrome
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      isTouchSwiping = true;
      isDragging = true;
      touchSwipeStartX = e.touches[0].clientX;
      touchSwipeStartY = e.touches[0].clientY;
      touchSwipeDeltaX = 0;
      dragStartTrackPos = targetTrackPos;
      holdElapsedMs = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTouchSwiping || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - touchSwipeStartX;
      const dy = e.touches[0].clientY - touchSwipeStartY;
      // If user is clearly scrolling vertically, release horizontal drag
      if (Math.abs(dy) > Math.abs(dx) * 1.35 && Math.abs(dx) < 12) {
        return;
      }
      if (Math.abs(dx) > 6 && e.cancelable) {
        e.preventDefault();
      }
      touchSwipeDeltaX = dx;
      const sens = Math.max(cfgRef.current.dragSens, 10) / 100;
      const mobileSpanPx = Math.min(container.clientWidth || 360, 320);
      targetTrackPos = dragStartTrackPos - (dx * sens) / mobileSpanPx;
      holdElapsedMs = 0;
    };

    const onTouchEnd = () => {
      if (!isTouchSwiping) return;
      isTouchSwiping = false;
      isDragging = false;
      // Snap forward/back cleanly on a quick flick (>= 32px)
      if (Math.abs(touchSwipeDeltaX) >= 32) {
        targetTrackPos =
          touchSwipeDeltaX < 0
            ? Math.round(dragStartTrackPos) + 1
            : Math.round(dragStartTrackPos) - 1;
      } else {
        targetTrackPos = Math.round(targetTrackPos);
      }
      holdElapsedMs = 0;
    };

    const onWheel = (e: WheelEvent) => {
      const dominantDelta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(dominantDelta) < 4) return;
      e.preventDefault();
      const sens = Math.max(cfgRef.current.dragSens, 10) / 100;
      targetTrackPos += dominantDelta * 0.0028 * sens;
      holdElapsedMs = 0;
    };

    const domElem = renderer.domElement;
    domElem.style.touchAction = 'pan-y';
    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    domElem.addEventListener('touchstart', onTouchStart, { passive: true });
    domElem.addEventListener('touchmove', onTouchMove, { passive: false });
    domElem.addEventListener('touchend', onTouchEnd);
    domElem.addEventListener('touchcancel', onTouchEnd);
    domElem.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let frameId = 0;
    const animate = (now: number) => {
      const dtMs = Math.min(now - lastFrameTime, 64);
      const dtSec = dtMs / 1000;
      lastFrameTime = now;

      const c = cfgRef.current;

      // Auto-advance with generous hold pause at each flat center card when speed > 0 (pauses on hover)
      if (!isDragging && !isPausedRef.current && c.speed > 0) {
        const distToSnap = Math.abs(targetTrackPos - currentTrackPos);
        if (distToSnap < 0.04) {
          holdElapsedMs += dtMs;
          // Ensure a comfortable minimum hold pause (at least 3400ms unless set higher)
          const effectiveHoldMs = Math.max(c.hold, 3400);
          if (holdElapsedMs >= effectiveHoldMs) {
            targetTrackPos = Math.round(targetTrackPos) + 1;
            holdElapsedMs = 0;
          }
        }
      } else if (!isDragging && c.speed === 0) {
        // Snap gently to nearest card when speed is 0 and not dragging
        targetTrackPos += (Math.round(targetTrackPos) - targetTrackPos) * 0.06;
      }

      // Smooth, unhurried glide & crumple transition physics
      const speedFactor = Math.max(c.speed, 3) / 15;
      const bounceRatio = Math.min(Math.max(c.bounce, 0), 100) / 100;
      if (isDragging) {
        currentTrackPos += (targetTrackPos - currentTrackPos) * 0.16;
        velocity = 0;
      } else if (bounceRatio > 0.01) {
        const stiffness = 36 * speedFactor;
        const damping = 11 - bounceRatio * 6.5;
        const force = (targetTrackPos - currentTrackPos) * stiffness;
        velocity = (velocity + force * dtSec) * Math.exp(-damping * dtSec);
        currentTrackPos += velocity * dtSec;
      } else {
        // Gentle ~1.6s glide between cards so you can watch the paper fold & unfold
        const lerpRate = Math.min(1, dtSec * 1.85 * speedFactor);
        currentTrackPos += (targetTrackPos - currentTrackPos) * lerpRate;
      }

      // Smooth pointer hover vector
      const hoverStrength = (c.hover / 100) * 1.4;
      smoothPointer.x += (pointerNorm.x * hoverStrength - smoothPointer.x) * 0.08;
      smoothPointer.y += (pointerNorm.y * hoverStrength - smoothPointer.y) * 0.08;

      // Report active center card index to React UI
      const wrappedActive =
        ((Math.round(currentTrackPos) % numItems) + numItems) % numItems;
      if (wrappedActive !== lastReportedIndex) {
        lastReportedIndex = wrappedActive;
        setActiveIndex(wrappedActive);
      }

      // Spacing between neighbouring cards in world units (100px = 1 unit)
      const cardWWorld = c.itemWidth / 100;
      const cardHWorld = c.itemHeight / 100;
      const baseDimWorld =
        c.direction === 'horizontal' ? cardWWorld : cardHWorld;
      const stepWorld = Math.max(baseDimWorld + c.gap / 100, 1.65);
      const stageOffsetY = c.imageY / 100;

      // Hold zone width: higher `hold` keeps the center card flat slightly wider before crumpling
      const flatDeadzone = Math.min(0.28, (c.hold / 1000) * 0.16);

      cardEntries.forEach((entry) => {
        // Shortest wrapped signed distance in [-numItems/2, +numItems/2]
        let rel = (entry.index - currentTrackPos) % numItems;
        if (rel > numItems * 0.5) rel -= numItems;
        if (rel < -numItems * 0.5) rel += numItems;

        const absRel = Math.abs(rel);

        // Crumple progress: 0.0 when flat in the centre, smoothly ramping to 1.0 as it leaves/arrives
        const rawCrumple = Math.max(0, (absRel - flatDeadzone) / (1.05 - flatDeadzone));
        const crumpleProgress = Math.min(1.0, Math.pow(rawCrumple, 0.92));

        // Position along carousel axis (horizontal or vertical)
        const axisPos = rel * stepWorld;
        // Slight Z recession for side paper balls so the flat center sheet never Z-fights
        const zDepth = -Math.min(absRel * 0.55, 2.2);

        if (c.direction === 'horizontal') {
          entry.mesh.position.set(axisPos, stageOffsetY, zDepth);
        } else {
          entry.mesh.position.set(0, stageOffsetY - axisPos, zDepth);
        }

        // Update shader uniforms from live props
        const u = entry.mat.uniforms;
        u.uProgress.value = crumpleProgress;
        u.uCrumpleDepth.value = c.crumple / 100;
        u.uCardSize.value.set(cardWWorld, cardHWorld);
        u.uCardSizePx.value.set(c.itemWidth, c.itemHeight);
        u.uRadiusPx.value = c.radius;
        u.uHoverTilt.value.copy(smoothPointer);
        u.uSignDir.value = rel >= 0 ? 1.0 : -1.0;

        // Hide cards far outside the viewport
        entry.mesh.visible = absRel < 3.2;
      });

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 1200;
      const h = container.clientHeight || 540;
      updateCameraZ(w, h);
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      domElem.removeEventListener('touchstart', onTouchStart);
      domElem.removeEventListener('touchmove', onTouchMove);
      domElem.removeEventListener('touchend', onTouchEnd);
      domElem.removeEventListener('touchcancel', onTouchEnd);
      domElem.removeEventListener('wheel', onWheel);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, [items]);

  const activeItem = items[activeIndex] || items[0];
  const activeLowestRule = activeItem?.pricingRules?.[0];

  const handleNavigate = (
    e: React.MouseEvent,
    type: 'details' | 'book',
    href: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigatingTo) return;
    setNavigatingTo(type);
    router.push(href);
  };

  return (
    <div
      className="space-y-4"
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') isPausedRef.current = true;
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') isPausedRef.current = false;
      }}
    >
      {/* Seamless, Borderless WebGL Crumple Card Carousel Stage Blending with Page Background */}
      <div
        className="relative overflow-visible select-none"
        style={{
          backgroundColor:
            cfg.background === 'transparent' || cfg.background === '#000000'
              ? 'transparent'
              : cfg.background,
        }}
      >
        {/* Subtle Ambient Glow Blending into the Page Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[340px] bg-gradient-to-tr from-oasis-purple/15 via-oasis-cyan/10 to-oasis-coral/15 rounded-full blur-[130px] pointer-events-none" />

        {/* Interactive Three.js WebGL Stage (No Box, No Borders, Soft Edge Blend) */}
        <div
          ref={stageRef}
          className="relative z-10 w-full h-[380px] sm:h-[490px] cursor-grab active:cursor-grabbing touch-pan-y"
          style={{
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            maskImage:
              'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          }}
        />

        {/* Borderless Left / Right Quick Step Arrows */}
        <button
          type="button"
          onClick={() => navStepRef.current(-1)}
          aria-label="Previous category card"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-oasis-navy/70 hover:bg-oasis-purple text-white shadow-xl backdrop-blur-md transition-all hover:scale-105"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => navStepRef.current(1)}
          aria-label="Next category card"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-oasis-navy/70 hover:bg-oasis-purple text-white shadow-xl backdrop-blur-md transition-all hover:scale-105"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Seamless Floating Bottom Caption & Action Bar (No Box or Borders) */}
        {activeItem && (
          <div className="relative z-20 px-2 sm:px-6 pt-2 pb-2 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-oasis-cyan/15 text-oasis-cyan">
                  {activeItem.category?.name || `Category ${activeIndex + 1}`}
                </span>
                <span className="text-xs font-bold text-oasis-yellow">
                  {activeLowestRule
                    ? `From ${formatCurrency(activeLowestRule.amountMinor, activeLowestRule.currency)}`
                    : 'View Rates'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {activeItem.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl line-clamp-1">
                {activeItem.description}
              </p>
            </div>

            {/* Category Indicator Dots + Direct Action Links */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              <div className="flex items-center gap-1.5 mr-2">
                {items.map((it, idx) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => navStepRef.current(idx - activeIndex)}
                    aria-label={`Go to ${it.name}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === activeIndex
                        ? 'w-7 bg-oasis-cyan'
                        : 'w-2 bg-white/25 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2.5 relative z-30">
                <Link
                  href={`/attractions/${activeItem.slug}`}
                  prefetch={true}
                  onClick={(e) =>
                    handleNavigate(
                      e,
                      'details',
                      `/attractions/${activeItem.slug}`,
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  {navigatingTo === 'details' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Opening...
                    </>
                  ) : (
                    <>
                      Details <ArrowUpRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Link>
                <Link
                  href={`/book?attraction=${activeItem.slug}`}
                  prefetch={true}
                  onClick={(e) =>
                    handleNavigate(
                      e,
                      'book',
                      `/book?attraction=${activeItem.slug}`,
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-oasis-purple to-oasis-coral text-white shadow-lg hover:opacity-95 transition-opacity cursor-pointer"
                >
                  {navigatingTo === 'book' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...
                    </>
                  ) : (
                    <>
                      <Ticket className="w-3.5 h-3.5" /> Book Now
                    </>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => setShowControls((prev) => !prev)}
                  title="Customize Crumple Carousel Props"
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                    showControls
                      ? 'bg-oasis-cyan text-oasis-navy'
                      : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Optional Live Controls Panel (Maps 1:1 to API Reference Sliders & Color Picker) */}
      {showControls && (
        <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="font-black text-sm text-white">
                Crumple Card Carousel — Live Shader &amp; Layout Controls
              </h4>
              <p className="text-slate-400 text-[11px]">
                All controls map directly to the component props (`background`,
                `imageY`, `hold`, `crumple`, `itemWidth`, `itemHeight`, `gap`,
                `radius`, `dragSens`, `direction`, `bounce`, `hover`, `speed`).
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setCfg({
                  background: 'transparent',
                  imageY: 0,
                  hold: 3600,
                  crumple: 100,
                  itemWidth: 507,
                  itemHeight: 400,
                  gap: -90,
                  radius: 14,
                  dragSens: 100,
                  direction: 'horizontal',
                  bounce: 0,
                  hover: 50,
                  speed: 6,
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-oasis-navy hover:bg-oasis-navyLight text-slate-300 border border-slate-700 font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>crumple (Crease Depth)</span>
                <span className="text-oasis-cyan">{cfg.crumple}</span>
              </div>
              <input
                type="range"
                min={0}
                max={160}
                value={cfg.crumple}
                onChange={(e) =>
                  setCfg({ ...cfg, crumple: Number(e.target.value) })
                }
                className="w-full accent-cyan-400"
              />
            </label>

            <label className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>speed (Animation Speed)</span>
                <span className="text-oasis-cyan">{cfg.speed}</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={cfg.speed}
                onChange={(e) =>
                  setCfg({ ...cfg, speed: Number(e.target.value) })
                }
                className="w-full accent-cyan-400"
              />
            </label>

            <label className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>hold (Centre Hold ms)</span>
                <span className="text-oasis-cyan">{cfg.hold}</span>
              </div>
              <input
                type="range"
                min={100}
                max={2500}
                step={50}
                value={cfg.hold}
                onChange={(e) =>
                  setCfg({ ...cfg, hold: Number(e.target.value) })
                }
                className="w-full accent-cyan-400"
              />
            </label>

            <label className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>gap (Card Spacing px)</span>
                <span className="text-oasis-cyan">{cfg.gap}</span>
              </div>
              <input
                type="range"
                min={-150}
                max={240}
                value={cfg.gap}
                onChange={(e) =>
                  setCfg({ ...cfg, gap: Number(e.target.value) })
                }
                className="w-full accent-cyan-400"
              />
            </label>

            <label className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>itemWidth (px)</span>
                <span className="text-oasis-cyan">{cfg.itemWidth}</span>
              </div>
              <input
                type="range"
                min={320}
                max={680}
                value={cfg.itemWidth}
                onChange={(e) =>
                  setCfg({ ...cfg, itemWidth: Number(e.target.value) })
                }
                className="w-full accent-cyan-400"
              />
            </label>

            <label className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>itemHeight (px)</span>
                <span className="text-oasis-cyan">{cfg.itemHeight}</span>
              </div>
              <input
                type="range"
                min={260}
                max={520}
                value={cfg.itemHeight}
                onChange={(e) =>
                  setCfg({ ...cfg, itemHeight: Number(e.target.value) })
                }
                className="w-full accent-cyan-400"
              />
            </label>

            <label className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>radius (Corner Radius)</span>
                <span className="text-oasis-cyan">{cfg.radius}</span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                value={cfg.radius}
                onChange={(e) =>
                  setCfg({ ...cfg, radius: Number(e.target.value) })
                }
                className="w-full accent-cyan-400"
              />
            </label>

            <label className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>hover (Pointer Tilt)</span>
                <span className="text-oasis-cyan">{cfg.hover}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={cfg.hover}
                onChange={(e) =>
                  setCfg({ ...cfg, hover: Number(e.target.value) })
                }
                className="w-full accent-cyan-400"
              />
            </label>

            <label className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>bounce (Overshoot)</span>
                <span className="text-oasis-cyan">{cfg.bounce}</span>
              </div>
              <input
                type="range"
                min={0}
                max={90}
                value={cfg.bounce}
                onChange={(e) =>
                  setCfg({ ...cfg, bounce: Number(e.target.value) })
                }
                className="w-full accent-cyan-400"
              />
            </label>

            <label className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>dragSens (Drag Sensitivity)</span>
                <span className="text-oasis-cyan">{cfg.dragSens}</span>
              </div>
              <input
                type="range"
                min={20}
                max={200}
                value={cfg.dragSens}
                onChange={(e) =>
                  setCfg({ ...cfg, dragSens: Number(e.target.value) })
                }
                className="w-full accent-cyan-400"
              />
            </label>

            <label className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>imageY (Vertical Offset)</span>
                <span className="text-oasis-cyan">{cfg.imageY}</span>
              </div>
              <input
                type="range"
                min={-120}
                max={120}
                value={cfg.imageY}
                onChange={(e) =>
                  setCfg({ ...cfg, imageY: Number(e.target.value) })
                }
                className="w-full accent-cyan-400"
              />
            </label>

            <div className="flex items-center justify-between gap-3 pt-2">
              <label className="space-y-1 flex-1">
                <span className="block text-slate-300 font-semibold">
                  direction
                </span>
                <select
                  value={cfg.direction}
                  onChange={(e) =>
                    setCfg({
                      ...cfg,
                      direction: e.target.value as 'horizontal' | 'vertical',
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-oasis-navy border border-slate-700 text-white"
                >
                  <option value="horizontal">horizontal</option>
                  <option value="vertical">vertical</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="block text-slate-300 font-semibold">
                  background
                </span>
                <input
                  type="color"
                  value={cfg.background}
                  onChange={(e) =>
                    setCfg({ ...cfg, background: e.target.value })
                  }
                  className="h-8 w-14 rounded cursor-pointer bg-transparent border border-slate-700"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
